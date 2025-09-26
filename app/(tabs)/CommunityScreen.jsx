import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import React, { useMemo, useState } from "react";
import { ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function CommunityScreen() {
  // Forum state (local placeholder)
  const [threads, setThreads] = useState([
    { id: "relapse", title: "Relapse Stories", posts: [{ id: "p1", text: "Had a setback last week, getting back up.", upvotes: 5, replies: [{ id: "r1", text: "Proud of you for trying again!" }] }] },
    { id: "motivation", title: "Motivation", posts: [{ id: "p2", text: "Day 14 — feeling clearer than ever.", upvotes: 12, replies: [] }] },
    { id: "tips", title: "Tips", posts: [{ id: "p3", text: "Cold showers + walk outside helped me.", upvotes: 8, replies: [] }] },
  ]);
  const [newPost, setNewPost] = useState("");
  const [activeThreadId, setActiveThreadId] = useState("relapse");
  const [replyDrafts, setReplyDrafts] = useState({});

  const activeThread = useMemo(() => threads.find((t) => t.id === activeThreadId), [threads, activeThreadId]);

  const handleUpvote = (postId) => {
    setThreads((prev) =>
      prev.map((t) =>
        t.id !== activeThreadId
          ? t
          : {
              ...t,
              posts: t.posts.map((p) => (p.id === postId ? { ...p, upvotes: p.upvotes + 1 } : p)),
            }
      )
    );
  };

  const handleAddPost = () => {
    if (!newPost.trim()) return;
    setThreads((prev) =>
      prev.map((t) =>
        t.id !== activeThreadId
          ? t
          : {
              ...t,
              posts: [{ id: `p${Date.now()}`, text: newPost.trim(), upvotes: 0, replies: [] }, ...t.posts],
            }
      )
    );
    setNewPost("");
  };

  const handleAddReply = (postId) => {
    const text = replyDrafts[postId]?.trim();
    if (!text) return;
    setThreads((prev) =>
      prev.map((t) =>
        t.id !== activeThreadId
          ? t
          : {
              ...t,
              posts: t.posts.map((p) =>
                p.id === postId ? { ...p, replies: [...p.replies, { id: `r${Date.now()}`, text }] } : p
              ),
            }
      )
    );
    setReplyDrafts((d) => ({ ...d, [postId]: "" }));
  };

  // Group Therapy (placeholder schedule)
  const [sessions] = useState([
    { id: "s1", title: "Evening Check-in", time: "Today 7:00 PM", mode: "text" },
    { id: "s2", title: "Weekend Recovery Circle", time: "Sat 10:00 AM", mode: "audio" },
  ]);
  const [joinedSessionId, setJoinedSessionId] = useState(null);

  const handleJoin = (id) => {
    setJoinedSessionId(id);
  };

  // Accountability Partner
  const [partnerCode, setPartnerCode] = useState("");
  const [connectedCode, setConnectedCode] = useState(null);
  const [shareStreak, setShareStreak] = useState(true);
  const [shareAlerts, setShareAlerts] = useState(false);
  const [messageDraft, setMessageDraft] = useState("");
  const [messages, setMessages] = useState([]);

  const handleConnect = () => {
    if (!partnerCode.trim()) return;
    setConnectedCode(partnerCode.trim());
    setPartnerCode("");
  };

  const handleSendMessage = () => {
    if (!messageDraft.trim() || !connectedCode) return;
    setMessages((m) => [...m, { id: `m${Date.now()}`, text: messageDraft.trim(), fromMe: true }]);
    setMessageDraft("");
  };

  return (
    <SafeAreaView className="flex-1 bg-[#0f0f1e]">
      <StatusBar style="light" />
      <View className="flex-1 bg-[#0f0f1e] px-4 pt-4">
        <View className="flex-row items-center mb-6">
          <Text className="text-white text-xl font-bold">Community & Support</Text>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} className="mb-6">
          {/* Anonymous Forum */}
          <LinearGradient colors={["#1a1a2e", "#0f0f1e"]} className="rounded-3xl p-5 mb-6" start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-white text-lg font-bold">Anonymous Forum</Text>
              <View className="flex-row">
                {threads.map((t) => (
                  <TouchableOpacity key={t.id} className="ml-2" onPress={() => setActiveThreadId(t.id)}>
                    <Text className="text-xs" style={{ color: activeThreadId === t.id ? "#6C63FF" : "#7a8b99" }}>{t.title}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View className="bg-[#151529] rounded-2xl p-3 mb-3">
              <TextInput
                value={newPost}
                onChangeText={setNewPost}
                placeholder={`Share to ${activeThread?.title}`}
                placeholderTextColor="#7a8b99"
                className="text-white"
              />
              <TouchableOpacity className="self-end mt-2 bg-[#6C63FF] px-3 py-1 rounded-lg" onPress={handleAddPost}>
                <Text className="text-white text-xs">Post</Text>
              </TouchableOpacity>
            </View>

            {activeThread?.posts.map((p) => (
              <View key={p.id} className="bg-[#1a1a2e] rounded-2xl p-4 mb-3">
                <Text className="text-white mb-2">{p.text}</Text>
                <View className="flex-row items-center mb-2">
                  <TouchableOpacity className="flex-row items-center mr-4" onPress={() => handleUpvote(p.id)}>
                    <MaterialCommunityIcons name="arrow-up-bold" size={18} color="#FFD700" />
                    <Text className="text-white text-xs ml-1">{p.upvotes}</Text>
                  </TouchableOpacity>
                </View>
                {p.replies?.length ? (
                  <View className="bg-[#151529] rounded-xl p-3 mb-2">
                    {p.replies.map((r) => (
                      <Text key={r.id} className="text-[#cfd6de] text-xs mb-1">• {r.text}</Text>
                    ))}
                  </View>
                ) : null}
                <View className="bg-[#151529] rounded-xl p-2 flex-row items-center">
                  <TextInput
                    value={replyDrafts[p.id] || ""}
                    onChangeText={(t) => setReplyDrafts((d) => ({ ...d, [p.id]: t }))}
                    placeholder="Reply anonymously"
                    placeholderTextColor="#7a8b99"
                    className="text-white flex-1"
                  />
                  <TouchableOpacity className="ml-2 bg-[#4BB38A] px-3 py-1 rounded-lg" onPress={() => handleAddReply(p.id)}>
                    <Text className="text-white text-xs">Reply</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </LinearGradient>

          {/* AI Group Therapy */}
          <LinearGradient colors={["#1a1a2e", "#0f0f1e"]} className="rounded-3xl p-5 mb-6" start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
            <Text className="text-white text-lg font-bold mb-3">AI Group Therapy</Text>
            {sessions.map((s) => (
              <View key={s.id} className="bg-[#1a1a2e] rounded-2xl p-4 mb-3">
                <View className="flex-row items-center mb-2">
                  <MaterialCommunityIcons name={s.mode === "audio" ? "microphone" : "message-text-outline"} size={18} color="#6C63FF" />
                  <Text className="text-white ml-2 font-semibold">{s.title}</Text>
                  <Text className="text-[#7a8b99] ml-auto text-xs">{s.time}</Text>
                </View>
                <Text className="text-[#7a8b99] text-xs mb-2">AI facilitator provides prompts and gentle moderation.</Text>
                {joinedSessionId === s.id ? (
                  <View className="bg-[#151529] rounded-xl p-3">
                    <Text className="text-[#cfd6de] text-xs">Prompt: "Share one win and one challenge today."</Text>
                  </View>
                ) : (
                  <TouchableOpacity className="self-start bg-[#4BB38A] px-3 py-1 rounded-lg" onPress={() => handleJoin(s.id)}>
                    <Text className="text-white text-xs">Join {s.mode === "audio" ? "Audio" : "Text"} Session</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </LinearGradient>

          {/* Accountability Partner Mode */}
          <LinearGradient colors={["#1a1a2e", "#0f0f1e"]} className="rounded-3xl p-5 mb-10" start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
            <Text className="text-white text-lg font-bold mb-3">Accountability Partner</Text>
            <View className="bg-[#151529] rounded-2xl p-3 mb-3">
              <TextInput
                value={partnerCode}
                onChangeText={setPartnerCode}
                placeholder="Enter or share your connect code"
                placeholderTextColor="#7a8b99"
                className="text-white"
              />
              <TouchableOpacity className="self-end mt-2 bg-[#6C63FF] px-3 py-1 rounded-lg" onPress={handleConnect}>
                <Text className="text-white text-xs">Connect</Text>
              </TouchableOpacity>
            </View>
            {connectedCode ? (
              <View className="bg-[#1a1a2e] rounded-2xl p-4 mb-3">
                <Text className="text-[#7a8b99] text-xs mb-2">Connected to: {connectedCode}</Text>
                <View className="flex-row mb-3">
                  <TouchableOpacity
                    className="bg-[#2d2d3a] px-3 py-2 rounded-lg mr-2"
                    onPress={() => setShareStreak((v) => !v)}
                  >
                    <Text className="text-white text-xs">Share Streak: {shareStreak ? "On" : "Off"}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    className="bg-[#2d2d3a] px-3 py-2 rounded-lg"
                    onPress={() => setShareAlerts((v) => !v)}
                  >
                    <Text className="text-white text-xs">Emergency Alerts: {shareAlerts ? "On" : "Off"}</Text>
                  </TouchableOpacity>
                </View>
                <View className="bg-[#151529] rounded-xl p-3 mb-2">
                  {messages.length ? (
                    messages.map((m) => (
                      <Text key={m.id} className="text-[#cfd6de] text-xs mb-1">
                        {m.fromMe ? "Me: " : "Partner: "}
                        {m.text}
                      </Text>
                    ))
                  ) : (
                    <Text className="text-[#7a8b99] text-xs">No messages yet</Text>
                  )}
                </View>
                <View className="bg-[#151529] rounded-xl p-2 flex-row items-center">
                  <TextInput
                    value={messageDraft}
                    onChangeText={setMessageDraft}
                    placeholder="Private message (placeholder)"
                    placeholderTextColor="#7a8b99"
                    className="text-white flex-1"
                  />
                  <TouchableOpacity className="ml-2 bg-[#4BB38A] px-3 py-1 rounded-lg" onPress={handleSendMessage}>
                    <Text className="text-white text-xs">Send</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <Text className="text-[#7a8b99] text-xs">Connect with a partner to share progress and messages.</Text>
            )}
          </LinearGradient>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}


