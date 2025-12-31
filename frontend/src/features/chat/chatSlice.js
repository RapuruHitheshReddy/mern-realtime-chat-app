import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";

/* ---------------- FETCH CHATS ---------------- */
export const fetchChats = createAsyncThunk(
  "chat/fetchChats",
  async (_, thunkAPI) => {
    try {
      const { data } = await api.get("/chat");
      return data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.message);
    }
  }
);

/* ---------------- SLICE ---------------- */
const chatSlice = createSlice({
  name: "chat",
  initialState: {
    chats: [],
    selectedChat: null,
    loading: false,
    error: null,
  },

  reducers: {
    /* Select chat */
    selectChat: (state, action) => {
      state.selectedChat = action.payload;
    },

    /* Sidebar latest message + reorder */
    updateLatestMessage: (state, action) => {
      const message = action.payload;
      const chatId = message.chat._id;

      const chat = state.chats.find((c) => c._id === chatId);
      if (chat) {
        chat.latestMessage = message;

        // WhatsApp-style reorder
        state.chats = [
          chat,
          ...state.chats.filter((c) => c._id !== chatId),
        ];
      }

      if (state.selectedChat?._id === chatId) {
        state.selectedChat.latestMessage = message;
      }
    },

    /* Online / Offline presence */
    updateUserPresence: (state, action) => {
      const { userId, isOnline, lastSeen } = action.payload;

      const updateUsers = (users) => {
        users.forEach((u) => {
          if (u._id === userId) {
            u.isOnline = isOnline;
            if (lastSeen) u.lastSeen = lastSeen;
          }
        });
      };

      state.chats.forEach((chat) => updateUsers(chat.users));
      if (state.selectedChat) updateUsers(state.selectedChat.users);
    },

    /* Read receipts */
    markChatAsRead: (state, action) => {
      const { chatId, userId, readAt } = action.payload;
      const timestamp = readAt || new Date().toISOString();

      const updateRead = (chat) => {
        chat.lastReadAt = {
          ...chat.lastReadAt,
          [userId]: timestamp,
        };
      };

      const chat = state.chats.find((c) => c._id === chatId);
      if (chat) updateRead(chat);

      if (state.selectedChat?._id === chatId) {
        updateRead(state.selectedChat);
      }
    },

    /* ✅ REAL-TIME GROUP UPDATE */
    updateGroupChat: (state, action) => {
      const updatedChat = action.payload;

      state.chats = state.chats.map((c) =>
        c._id === updatedChat._id ? updatedChat : c
      );

      if (state.selectedChat?._id === updatedChat._id) {
        state.selectedChat = updatedChat;
      }
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(fetchChats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchChats.fulfilled, (state, action) => {
        state.loading = false;
        state.chats = action.payload;
      })
      .addCase(fetchChats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  selectChat,
  updateLatestMessage,
  updateUserPresence,
  markChatAsRead,
  updateGroupChat,
} = chatSlice.actions;

export default chatSlice.reducer;
