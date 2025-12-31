import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";

/* -------------------- THUNKS -------------------- */

/* 📥 Fetch messages of a chat */
export const fetchMessages = createAsyncThunk(
  "message/fetchMessages",
  async (chatId, thunkAPI) => {
    try {
      const { data } = await api.get(`/message/${chatId}`);
      return data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.message);
    }
  }
);

/* 📤 Send message */
export const sendMessage = createAsyncThunk(
  "message/sendMessage",
  async (
    { chatId, content, mediaUrl = "", messageType = "text" },
    thunkAPI
  ) => {
    try {
      const { data } = await api.post("/message", {
        chatId,
        content,
        mediaUrl,
        messageType,
      });

      return data;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Failed to send message"
      );
    }
  }
);

/* -------------------- SLICE -------------------- */

const messageSlice = createSlice({
  name: "message",
  initialState: {
    messages: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearMessages: (state) => {
      state.messages = [];
    },

    /* Used by socket events */
    addMessage: (state, action) => {
      state.messages.push(action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      /* ---------------- FETCH MESSAGES ---------------- */
      .addCase(fetchMessages.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.loading = false;
        state.messages = action.payload;
      })
      .addCase(fetchMessages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* ---------------- SEND MESSAGE ---------------- */
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.messages.push(action.payload);
      });
  },
});

export const { clearMessages, addMessage } = messageSlice.actions;
export default messageSlice.reducer;
