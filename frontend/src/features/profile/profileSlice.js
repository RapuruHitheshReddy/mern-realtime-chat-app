import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";
import { updateUser } from "../auth/authSlice";

/* ---------------------------------------------
   Fetch my profile
--------------------------------------------- */
export const fetchMyProfile = createAsyncThunk(
  "profile/fetchMyProfile",
  async (_, thunkAPI) => {
    try {
      const { data } = await api.get("/user/me");
      return data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.message);
    }
  }
);

/* ---------------------------------------------
   Fetch public profile
--------------------------------------------- */
export const fetchPublicProfile = createAsyncThunk(
  "profile/fetchPublicProfile",
  async (userId, thunkAPI) => {
    try {
      const { data } = await api.get(`/user/${userId}`);
      return data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.message);
    }
  }
);

/* ---------------------------------------------
   Update profile (name + bio)
--------------------------------------------- */
export const updateMyProfile = createAsyncThunk(
  "profile/updateMyProfile",
  async (payload, thunkAPI) => {
    try {
      const { data } = await api.put("/user/me", payload);

      // keep auth.user in sync
      thunkAPI.dispatch(updateUser(data));

      return data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.message);
    }
  }
);

/* ---------------------------------------------
   Upload avatar
--------------------------------------------- */
export const uploadAvatar = createAsyncThunk(
  "profile/uploadAvatar",
  async (file, thunkAPI) => {
    try {
      const formData = new FormData();
      formData.append("avatar", file);

      const { data } = await api.post("/user/avatar", formData);

      // sync avatar everywhere
      thunkAPI.dispatch(updateUser({ avatar: data.avatar }));

      return data.avatar;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.message);
    }
  }
);

/* ---------------------------------------------
   Slice
--------------------------------------------- */
const profileSlice = createSlice({
  name: "profile",
  initialState: {
    me: null,
    publicUser: null,
    loading: false,
    updating: false,
    uploadingAvatar: false,
    error: null,
  },
  reducers: {
    clearProfile: (state) => {
      state.me = null;
      state.publicUser = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      /* ================= FETCH MY PROFILE ================= */
      .addCase(fetchMyProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.me = action.payload;
      })
      .addCase(fetchMyProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* ================= FETCH PUBLIC PROFILE ================= */
      .addCase(fetchPublicProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPublicProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.publicUser = action.payload;
      })
      .addCase(fetchPublicProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* ================= UPDATE PROFILE ================= */
      .addCase(updateMyProfile.pending, (state) => {
        state.updating = true;
        state.error = null;
      })
      .addCase(updateMyProfile.fulfilled, (state, action) => {
        state.updating = false;
        state.me = action.payload;
      })
      .addCase(updateMyProfile.rejected, (state, action) => {
        state.updating = false;
        state.error = action.payload;
      })

      /* ================= AVATAR UPLOAD ================= */
      .addCase(uploadAvatar.pending, (state) => {
        state.uploadingAvatar = true;
        state.error = null;
      })
      .addCase(uploadAvatar.fulfilled, (state, action) => {
        state.uploadingAvatar = false;
        if (state.me) {
          state.me.avatar = action.payload;
        }
      })
      .addCase(uploadAvatar.rejected, (state, action) => {
        state.uploadingAvatar = false;
        state.error = action.payload;
      });
  },
});

export const { clearProfile } = profileSlice.actions;
export default profileSlice.reducer;
