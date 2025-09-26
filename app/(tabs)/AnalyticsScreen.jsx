import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import { doc, getDoc } from "firebase/firestore";
import { useEffect, useMemo, useState } from "react";
import { Dimensions, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { auth, db } from "../../firebaseConfig";

const { width: screenWidth } = Dimensions.get('window');

export default function AnalyticsScreen() {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const user = auth.currentUser;
        if (!user) return;
        const snap = await getDoc(doc(db, "users", user.uid));
        if (snap.exists()) setUserData(snap.data());
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const currentStreak = userData?.currentStreak ?? 0;
  const bestStreak = userData?.bestStreak ?? 0;
  const resets = userData?.relapseCount ?? 0;
  const badges = userData?.badges ?? [];
  
  // Mock data for enhanced analytics
  const streakHistory = [3, 7, 2, 14, 5, 21, currentStreak]; // Past streaks
  const moodData = [3, 4, 2, 5, 3, 4, 4]; // Last 7 days mood (1-5)
  const triggerData = [
    { name: 'Boredom', count: 8, color: '#FF6584' },
    { name: 'Stress', count: 6, color: '#6C63FF' },
    { name: 'Loneliness', count: 4, color: '#FF9500' },
    { name: 'Fatigue', count: 3, color: '#4BB38A' },
  ];

  // Heat map data (0-23 hours)
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const heatData = [0, 0, 0, 0, 0, 0, 1, 2, 1, 0, 0, 1, 1, 0, 2, 1, 2, 3, 2, 4, 6, 8, 5, 2];

  const avgMood = useMemo(() => {
    return (moodData.reduce((a, b) => a + b, 0) / moodData.length).toFixed(1);
  }, [moodData]);

  // Resilience Score (0-100)
  const resilienceScore = useMemo(() => {
    const streakFactor = Math.min(30, currentStreak * 2);
    const moodFactor = Number(avgMood) * 10;
    const consistencyFactor = streakHistory.length * 5;
    return Math.min(100, Math.round(streakFactor + moodFactor + consistencyFactor));
  }, [currentStreak, avgMood, streakHistory.length]);

  const trend = useMemo(() => {
    const recentStreaks = streakHistory.slice(-3);
    const isImproving = recentStreaks.every((streak, i) => i === 0 || streak >= recentStreaks[i - 1]);
    
    if (isImproving && Number(avgMood) >= 3.5) {
      return { label: "Improving", color: "#4BB38A", icon: "trending-up" };
    }
    if (Number(avgMood) < 2.5) {
      return { label: "Needs Attention", color: "#FF6584", icon: "trending-down" };
    }
    return { label: "Stable", color: "#6C63FF", icon: "trending-neutral" };
  }, [avgMood, streakHistory]);

  const availableBadges = [
    { id: '7day', name: '7-Day Streak', icon: 'calendar-week', progress: Math.min(100, (currentStreak / 7) * 100) },
    { id: '30day', name: '30-Day Streak', icon: 'calendar-month', progress: Math.min(100, (currentStreak / 30) * 100) },
    { id: '100day', name: '100-Day Streak', icon: 'trophy', progress: Math.min(100, (currentStreak / 100) * 100) },
    { id: 'mood', name: 'Mood Master', icon: 'emoticon-happy', progress: Number(avgMood) * 20 },
  ];

  return (
    <SafeAreaView className="flex-1 bg-[#0f0f1e]">
      <StatusBar style="light" />
      <View className="flex-1 bg-[#0f0f1e] px-4 pt-4">
        <View className="flex-row items-center mb-6">
          <Text className="text-white text-2xl font-bold">Analytics</Text>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
          {/* Section 1: My Momentum */}
          <LinearGradient colors={["#1a1a2e", "#0f0f1e"]} className="rounded-3xl p-5 mb-6" start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
            <Text className="text-white text-xl font-bold mb-4">My Momentum</Text>
            
            {/* Core Stats */}
            <View className="flex-row justify-between mb-6">
              <View className="items-center flex-1">
                <Text className="text-[#7a8b99] text-sm mb-1">Days Streaked</Text>
                <Text className="text-white text-3xl font-bold">{currentStreak}</Text>
              </View>
              <View className="items-center flex-1">
                <Text className="text-[#7a8b99] text-sm mb-1">Longest Streak</Text>
                <Text className="text-white text-3xl font-bold">{bestStreak}</Text>
              </View>
              <View className="items-center flex-1">
                <Text className="text-[#7a8b99] text-sm mb-1">Resets</Text>
                <Text className="text-white text-3xl font-bold">{resets}</Text>
              </View>
            </View>

            {/* Streak History Chart */}
            <View>
              <Text className="text-[#7a8b99] text-sm mb-3">Streak History</Text>
              <View className="flex-row items-end justify-between h-16">
                {streakHistory.map((streak, index) => (
                  <View key={index} className="flex-1 items-center mx-1">
                    <View 
                      className="bg-[#6C63FF] rounded-t-sm w-full"
                      style={{ 
                        height: Math.max(4, (streak / Math.max(...streakHistory)) * 60),
                        backgroundColor: index === streakHistory.length - 1 ? '#4BB38A' : '#6C63FF'
                      }}
                    />
                    <Text className="text-[#7a8b99] text-xs mt-1">{streak}</Text>
                  </View>
                ))}
              </View>
              <Text className="text-[#4BB38A] text-xs mt-2">📈 Your streaks are getting longer over time!</Text>
            </View>
          </LinearGradient>

          {/* Section 2: Mood & Well-being */}
          <LinearGradient colors={["#1a1a2e", "#0f0f1e"]} className="rounded-3xl p-5 mb-6" start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
            <Text className="text-white text-xl font-bold mb-4">Mood & Well-being</Text>
            
            {/* Mood Trend Graph */}
            <View className="mb-4">
              <View className="flex-row justify-between items-center mb-3">
                <Text className="text-[#7a8b99] text-sm">Last 7 days</Text>
                <Text className="text-white text-lg font-semibold">Avg: {avgMood}</Text>
              </View>
              
              <View className="flex-row items-end justify-between h-12 mb-2">
                {moodData.map((mood, index) => (
                  <View key={index} className="flex-1 items-center mx-1">
                    <View 
                      className="bg-[#4BB38A] rounded-t-sm w-full"
                      style={{ height: (mood / 5) * 48 }}
                    />
                  </View>
                ))}
              </View>
              
              <View className="flex-row justify-between">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => (
                  <Text key={index} className="text-[#7a8b99] text-xs flex-1 text-center">{day}</Text>
                ))}
              </View>
            </View>

            {/* AI Insight */}
            <View className="bg-[#0f0f1e] rounded-2xl p-3">
              <View className="flex-row items-center mb-2">
                <MaterialCommunityIcons name="lightbulb" size={16} color="#FFD700" />
                <Text className="text-[#FFD700] text-sm font-semibold ml-2">AI Insight</Text>
              </View>
              <Text className="text-[#7a8b99] text-sm">
                Your mood is highest on days you complete meditation exercises. Keep up the mindfulness practice!
              </Text>
            </View>
          </LinearGradient>

          {/* Section 3: Trigger Analysis */}
          <LinearGradient colors={["#1a1a2e", "#0f0f1e"]} className="rounded-3xl p-5 mb-6" start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
            <Text className="text-white text-xl font-bold mb-4">Trigger Analysis</Text>
            
            {/* Trigger Type Chart */}
            <View className="mb-4">
              <Text className="text-[#7a8b99] text-sm mb-3">Most Common Triggers</Text>
              {triggerData.map((trigger, index) => (
                <View key={index} className="mb-3">
                  <View className="flex-row justify-between items-center mb-1">
                    <Text className="text-white text-sm">{trigger.name}</Text>
                    <Text className="text-[#7a8b99] text-xs">{trigger.count}</Text>
                  </View>
                  <View className="w-full h-2 bg-[#2d2d3a] rounded-full">
                    <View 
                      className="h-2 rounded-full"
                      style={{ 
                        width: `${(trigger.count / Math.max(...triggerData.map(t => t.count))) * 100}%`,
                        backgroundColor: trigger.color 
                      }}
                    />
                  </View>
                </View>
              ))}
            </View>

            {/* Compact Heatmap */}
            <View className="mb-4">
              <Text className="text-[#7a8b99] text-sm mb-3">Time Pattern</Text>
              <View className="flex-row flex-wrap">
                {hours.map((hour) => {
                  const intensity = heatData[hour];
                  const opacity = intensity === 0 ? 0.1 : Math.min(1, 0.2 + (intensity / 8) * 0.8);
                  return (
                    <View 
                      key={hour} 
                      className="w-[4%] aspect-square rounded-sm mr-1 mb-1"
                      style={{ backgroundColor: `rgba(108, 99, 255, ${opacity})` }}
                    />
                  );
                })}
              </View>
            </View>

            {/* AI Insight */}
            <View className="bg-[#0f0f1e] rounded-2xl p-3">
              <View className="flex-row items-center mb-2">
                <MaterialCommunityIcons name="lightbulb" size={16} color="#FFD700" />
                <Text className="text-[#FFD700] text-sm font-semibold ml-2">AI Insight</Text>
              </View>
              <Text className="text-[#7a8b99] text-sm">
                Your most common trigger is 'Boredom' between 8 PM and 10 PM. Try scheduling a 'Dopamine Swap' then.
              </Text>
            </View>
          </LinearGradient>

          {/* Section 4: Insight Engine */}
          <LinearGradient colors={["#1a1a2e", "#0f0f1e"]} className="rounded-3xl p-5 mb-6" start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
            <Text className="text-white text-xl font-bold mb-4">Insight Engine</Text>
            
            {/* Resilience Score */}
            <View className="items-center mb-4">
              <View className="w-32 h-32 items-center justify-center mb-3">
                <View 
                  className="w-32 h-32 rounded-full items-center justify-center border-8"
                  style={{ borderColor: `rgba(75, 179, 138, ${resilienceScore / 100})` }}
                >
                  <Text className="text-white text-3xl font-bold">{resilienceScore}</Text>
                  <Text className="text-[#7a8b99] text-sm">Resilience</Text>
                </View>
              </View>
              
              <Text className="text-[#7a8b99] text-sm text-center mb-3">
                Your score increases with daily check-ins, module completion, and streaks.
              </Text>
              
              <View className="flex-row items-center">
                <MaterialCommunityIcons name={trend.icon} size={20} color={trend.color} />
                <Text className="text-white text-sm ml-2">Trend:</Text>
                <Text className="text-white text-lg font-bold ml-2" style={{ color: trend.color }}>
                  {trend.label}
                </Text>
              </View>
            </View>
          </LinearGradient>

          {/* Section 5: Milestones & Achievements */}
          <LinearGradient colors={["#1a1a2e", "#0f0f1e"]} className="rounded-3xl p-5 mb-6" start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
            <Text className="text-white text-xl font-bold mb-4">Milestones & Achievements</Text>
            
            {/* Earned Badges */}
            <View className="mb-4">
              <Text className="text-[#7a8b99] text-sm mb-3">Earned Badges</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {badges.length > 0 ? (
                  badges.map((badge, index) => (
                    <View key={index} className="items-center mr-4">
                      <LinearGradient
                        colors={["#FFD700", "#FF9500"]}
                        className="w-16 h-16 rounded-full items-center justify-center mb-2"
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                      >
                        <MaterialCommunityIcons name="trophy" size={24} color="white" />
                      </LinearGradient>
                      <Text className="text-white text-xs text-center w-16">{badge}</Text>
                    </View>
                  ))
                ) : (
                  <Text className="text-[#7a8b99] text-sm">Complete challenges to earn your first badge!</Text>
                )}
              </ScrollView>
            </View>

            {/* Next Unlocks */}
            <View>
              <Text className="text-[#7a8b99] text-sm mb-3">Next Unlock</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {availableBadges.map((badge) => (
                  <View key={badge.id} className="items-center mr-4">
                    <View 
                      className="w-16 h-16 rounded-full items-center justify-center mb-2 border-2"
                      style={{ 
                        backgroundColor: badge.progress >= 100 ? '#4BB38A' : '#2d2d3a',
                        borderColor: badge.progress >= 100 ? '#4BB38A' : '#4a4a5a',
                        opacity: badge.progress >= 100 ? 1 : 0.6
                      }}
                    >
                      <MaterialCommunityIcons 
                        name={badge.icon} 
                        size={20} 
                        color={badge.progress >= 100 ? "white" : "#7a8b99"} 
                      />
                    </View>
                    <Text className="text-[#7a8b99] text-xs text-center w-16 mb-1">{badge.name}</Text>
                    <View className="w-16 h-1 bg-[#2d2d3a] rounded-full">
                      <View 
                        className="h-1 bg-[#6C63FF] rounded-full"
                        style={{ width: `${Math.min(100, badge.progress)}%` }}
                      />
                    </View>
                    <Text className="text-[#7a8b99] text-xs mt-1">{Math.round(badge.progress)}%</Text>
                  </View>
                ))}
              </ScrollView>
            </View>
          </LinearGradient>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}


