import { MaterialCommunityIcons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { FlatList, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";


export default function CommunityScreen() {
  // Tab state: "feed" or "dms"
  const [activeTab, setActiveTab] = useState("feed");

  // Feed state (Twitter/Reddit style)
  const [posts, setPosts] = useState([
    {
      id: "p1",
      user: "@dopaminer",
      avatar: "partial-react-logo.png",
      text: "Had a setback last week, getting back up. #RelapseStory",
      upvotes: 5,
      replies: [
        { id: "r1", user: "@supporter", text: "Proud of you for trying again!" },
      ],
      timestamp: "2h ago",
    },
    {
      id: "p2",
      user: "@clarity",
      avatar: "react-logo.png",
      text: "Day 14 — feeling clearer than ever. #Motivation",
      upvotes: 12,
      replies: [],
      timestamp: "5h ago",
    },
    {
      id: "p3",
      user: "@tips_guy",
      avatar: "icon.png",
      text: "Cold showers + walk outside helped me. #Tips",
      upvotes: 8,
      replies: [],
      timestamp: "1d ago",
    },
  ]);
  const [newPost, setNewPost] = useState("");
  const [replyDrafts, setReplyDrafts] = useState({});

  // DMs state
  const [conversations, setConversations] = useState([
    {
      id: "dm1",
      name: "Recovery Group",
      avatar: "resolve.png",
      messages: [
        { id: "m1", text: "Welcome to the group!", fromMe: false },
        { id: "m2", text: "Thanks! Glad to be here.", fromMe: true },
      ],
    },
    {
      id: "dm2",
      name: "@clarity",
      avatar: "react-logo.png",
      messages: [
        { id: "m1", text: "How's your streak going?", fromMe: false },
      ],
    },
  ]);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [dmDraft, setDmDraft] = useState("");

  // Feed actions
  const handleUpvote = (postId) => {
    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, upvotes: p.upvotes + 1 } : p))
    );
  };

  const handleAddPost = () => {
    if (!newPost.trim()) return;
    setPosts([
      {
        id: `p${Date.now()}`,
        user: "@me",
        avatar: "android-icon-foreground.png",
        text: newPost.trim(),
        upvotes: 0,
        replies: [],
        timestamp: "now",
      },
      ...posts,
    ]);
    setNewPost("");
  };

  const handleAddReply = (postId) => {
    const text = replyDrafts[postId]?.trim();
    if (!text) return;
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? {
              ...p,
              replies: [...p.replies, { id: `r${Date.now()}`, user: "@me", text }],
            }
          : p
      )
    );
    setReplyDrafts((d) => ({ ...d, [postId]: "" }));
  };

  // DMs actions
  const handleSendDm = () => {
    if (!dmDraft.trim() || !activeConversationId) return;
    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeConversationId
          ? {
              ...c,
              messages: [...c.messages, { id: `m${Date.now()}`, text: dmDraft.trim(), fromMe: true }],
            }
          : c
      )
    );
    setDmDraft("");
  };

  // UI
  return (
    <SafeAreaView className="flex-1 bg-[#0f0f1e]">
      <StatusBar style="light" />
      <View className="flex-1 bg-[#0f0f1e] px-4 pt-4">
        <View className="flex-row items-center mb-6">
          <Text className="text-white text-xl font-bold">Community</Text>
        </View>
        {/* Tabs */}
        <View className="flex-row mb-4">
          <TouchableOpacity
            className={`flex-1 py-2 rounded-xl mr-2 ${activeTab === "feed" ? "bg-[#6C63FF]" : "bg-[#151529]"}`}
            onPress={() => setActiveTab("feed")}
          >
            <Text className="text-white text-center font-semibold">Feed</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className={`flex-1 py-2 rounded-xl ${activeTab === "dms" ? "bg-[#6C63FF]" : "bg-[#151529]"}`}
            onPress={() => setActiveTab("dms")}
          >
            <Text className="text-white text-center font-semibold">DMs</Text>
          </TouchableOpacity>
        </View>

        {/* Feed Section */}
        {activeTab === "feed" && (
          <View className="flex-1">
            <View className="bg-[#151529] rounded-2xl p-3 mb-3">
              <TextInput
                value={newPost}
                onChangeText={setNewPost}
                placeholder="What's happening? Share your experience..."
                placeholderTextColor="#7a8b99"
                className="text-white"
                multiline
              />
              <TouchableOpacity className="self-end mt-2 bg-[#6C63FF] px-3 py-1 rounded-lg" onPress={handleAddPost}>
                <Text className="text-white text-xs">Post</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={posts}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => (
                <View className="bg-[#1a1a2e] rounded-2xl p-4 mb-3">
                  <View className="flex-row items-center mb-2">
                    <View className="w-8 h-8 rounded-full bg-[#151529] mr-2 items-center justify-center">
                      {/* Avatar placeholder, could use Image if available */}
                      <MaterialCommunityIcons name="account" size={24} color="#6C63FF" />
                    </View>
                    <Text className="text-white font-semibold">{item.user}</Text>
                    <Text className="text-[#7a8b99] ml-auto text-xs">{item.timestamp}</Text>
                  </View>
                  <Text className="text-white mb-2">{item.text}</Text>
                  <View className="flex-row items-center mb-2">
                    <TouchableOpacity className="flex-row items-center mr-4" onPress={() => handleUpvote(item.id)}>
                      <MaterialCommunityIcons name="arrow-up-bold" size={18} color="#FFD700" />
                      <Text className="text-white text-xs ml-1">{item.upvotes}</Text>
                    </TouchableOpacity>
                  </View>
                  {item.replies?.length ? (
                    <View className="bg-[#151529] rounded-xl p-3 mb-2">
                      {item.replies.map((r) => (
                        <Text key={r.id} className="text-[#cfd6de] text-xs mb-1">{r.user}: {r.text}</Text>
                      ))}
                    </View>
                  ) : null}
                  <View className="bg-[#151529] rounded-xl p-2 flex-row items-center">
                    <TextInput
                      value={replyDrafts[item.id] || ""}
                      onChangeText={(t) => setReplyDrafts((d) => ({ ...d, [item.id]: t }))}
                      placeholder="Reply..."
                      placeholderTextColor="#7a8b99"
                      className="text-white flex-1"
                    />
                    <TouchableOpacity className="ml-2 bg-[#4BB38A] px-3 py-1 rounded-lg" onPress={() => handleAddReply(item.id)}>
                      <Text className="text-white text-xs">Reply</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            />
          </View>
        )}

        {/* DMs Section */}
        {activeTab === "dms" && (
          <View className="flex-1">
            {/* If no conversation selected, show chat list. If selected, show chat full width */}
            {!activeConversationId ? (
              <View className="flex-1">
                <Text className="text-white text-lg font-bold mb-4">Chats</Text>
                <ScrollView showsVerticalScrollIndicator={false}>
                  {conversations.map((c) => (
                    <TouchableOpacity
                      key={c.id}
                      className={`flex-row items-center mb-4 p-3 rounded-2xl border ${activeConversationId === c.id ? "bg-[#6C63FF] border-[#6C63FF]" : "bg-[#151529] border-[#23234a]"}`}
                      onPress={() => setActiveConversationId(c.id)}
                    >
                      <View className="w-9 h-9 rounded-full bg-[#1a1a2e] mr-3 items-center justify-center">
                        <MaterialCommunityIcons name="account-group" size={24} color="#4BB38A" />
                      </View>
                      <Text className="text-white font-bold text-base">{c.name}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            ) : (
              <View className="flex-1">
                <View className="flex-row items-center mb-4">
                  <TouchableOpacity onPress={() => setActiveConversationId(null)} className="mr-2">
                    <MaterialCommunityIcons name="arrow-left" size={22} color="#6C63FF" />
                  </TouchableOpacity>
                  <Text className="text-white text-lg font-bold">{conversations.find((c) => c.id === activeConversationId)?.name}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <ScrollView
                    className="flex-1 bg-[#18182f] rounded-3xl p-4 border border-[#23234a]"
                    contentContainerStyle={{ paddingBottom: 80 }}
                  >
                    {conversations
                      .find((c) => c.id === activeConversationId)
                      ?.messages.map((m) => (
                        <View
                          key={m.id}
                          className={`mb-3 flex-row ${m.fromMe ? "justify-end" : "justify-start"}`}
                        >
                          <View
                            className={`max-w-[75%] px-4 py-2 rounded-2xl ${
                              m.fromMe
                                ? "bg-[#6C63FF] border border-[#6C63FF]"
                                : "bg-[#23234a] border border-[#2d2d3a]"
                            }`}
                          >
                            <Text className={`text-xs ${m.fromMe ? "text-white" : "text-[#cfd6de]"}`}>{m.text}</Text>
                          </View>
                        </View>
                      ))}
                  </ScrollView>
                  {/* Chat input fixed at bottom */}
                  <View style={{ position: "absolute", left: 0, right: 0, bottom: 0 }}>
                    <View className="flex-row items-center bg-[#23234a] rounded-2xl p-3 m-4 border border-[#2d2d3a]">
                      <TextInput
                        value={dmDraft}
                        onChangeText={setDmDraft}
                        placeholder="Type a message..."
                        placeholderTextColor="#7a8b99"
                        className="text-white flex-1 text-xs"
                        style={{ minHeight: 32 }}
                      />
                      <TouchableOpacity className="ml-2 bg-[#4BB38A] px-4 py-2 rounded-xl shadow" onPress={handleSendDm}>
                        <Text className="text-white text-xs font-semibold">Send</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </View>
            )}
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}


