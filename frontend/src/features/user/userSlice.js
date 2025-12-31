import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

export const searchUsers = createAsyncThunk(
  "user/search",
  async (query, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.token;

      const res = await fetch(
        `http://localhost:5000/api/user?search=${query}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      return data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.message);
    }
  }
);

const userSlice = createSlice({
  name: "user",
  initialState: {
    users: [],
    loading: false,
  },
  reducers: {
    clearUsers: (state) => {
      state.users = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(searchUsers.pending, (state) => {
        state.loading = true;
      })
      .addCase(searchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload;
      })
      .addCase(searchUsers.rejected, (state) => {
        state.loading = false;
      });
  },
});

export const { clearUsers } = userSlice.actions;
export default userSlice.reducer;
