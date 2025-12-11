import Conversation from "../models/conversation.model.js";
import Message from "../models/message.model.js";
import { getReceiverSocketId, io } from "../server.js";

export const sendMessage = async (req, res) => {
  try {
    const { message } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    let conversation = await Conversation.findOne({
      participants: { $all: [senderId, receiverId] },
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [senderId, receiverId],
      });
    }

    const newMessage = new Message({
      senderId,
      receiverId,
      message,
    });

    if (newMessage) {
      conversation.messages.push(newMessage._id);
    }

    await Promise.all([conversation.save(), newMessage.save()]);

    // Populate the senderId field before sending via socket
    const populatedMessage = await Message.findById(newMessage._id).populate({
      path: "senderId",
      select: "fullName profilePic",
    });

    // Socket.IO functionality - send message to specific user
    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", populatedMessage);
    }

    res.status(201).json(populatedMessage);
  } catch (err) {
    console.log("Error in sendMessage controller: " + err.message);
    res.status(500).json({ error: "Internal server error: " + err.message });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { id: userToChatId } = req.params;
    const senderId = req.user._id;

    const conversation = await Conversation.findOne({
      participants: { $all: [senderId, userToChatId] },
    }).populate({
      path: "messages",
      populate: {
        path: "senderId",
        select: "fullName profilePic",
      },
    });

    if (!conversation) return res.status(200).json([]);

    const messages = conversation.messages;

    res.status(200).json(messages);
  } catch (err) {
    console.log("Error in getMessages controller: " + err.message);
    res.status(500).json({ error: "Internal server error: " + err.message });
  }
};