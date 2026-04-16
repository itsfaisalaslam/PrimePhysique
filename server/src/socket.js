import Message from "./models/Message.js";

export const configureSocket = (io) => {
  io.on("connection", (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    socket.on("join", (userId) => {
      if (!userId) {
        return;
      }

      socket.join(String(userId));
      console.log(`User joined socket room: ${userId}`);
    });

    socket.on("sendMessage", async (data) => {
      try {
        const { senderId, receiverId, text } = data || {};

        if (!senderId || !receiverId || !text?.trim()) {
          return;
        }

        const message = await Message.create({
          sender: senderId,
          receiver: receiverId,
          text: text.trim()
        });

        const populatedMessage = await Message.findById(message._id)
          .populate("sender", "name email")
          .populate("receiver", "name email");

        io.to(String(receiverId)).emit("receiveMessage", populatedMessage);
        io.to(String(senderId)).emit("receiveMessage", populatedMessage);
      } catch (error) {
        socket.emit("chatError", "Failed to send message.");
      }
    });

    socket.on("disconnect", () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });
};
