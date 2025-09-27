import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import {
  arrayUnion,
  doc,
  getDoc,
  serverTimestamp,
  updateDoc
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { Modal, ScrollView, Text, ToastAndroid, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { auth, db } from "../../firebaseConfig";

export default function HomeScreen() {
  const navigation = useNavigation();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [progressScore, setProgressScore] = useState(52); // Default progress score
  const [rewardPoints, setRewardPoints] = useState(140); // Default reward points
  const [showTriggerDropdown, setShowTriggerDropdown] = useState(false);
  const [todayMood, setTodayMood] = useState(null);
  
  const badgeMilestones = [
    { days: 1, name: "1-Day Badge" },
    { days: 7, name: "7-Day Badge" },
    { days: 30, name: "30-Day Badge" },
    { days: 100, name: "100-Day Badge" },
  ];
  
  const triggerOptions = [
    { id: 'bored', name: 'Bored', icon: 'clock-outline', color: '#FF6584' },
    { id: 'stressed', name: 'Stressed', icon: 'emoticon-stressed', color: '#6C63FF' },
    { id: 'fatigued', name: 'Fatigued', icon: 'sleep', color: '#FF9500' },
    { id: 'lonely', name: 'Lonely', icon: 'account-heart', color: '#4BB38A' },
  ];
  
  const feelingOptions = {
    positive: [
      { id: 'good', name: 'Good', icon: 'emoticon-happy', color: '#4BB38A' },
      { id: 'neutral', name: 'Neutral', icon: 'emoticon-neutral', color: '#6C63FF' },
    ],
    negative: [
      { id: 'bored', name: 'Bored', icon: 'clock-outline', color: '#FF6584' },
      { id: 'stressed', name: 'Stressed', icon: 'emoticon-stressed', color: '#6C63FF' },
      { id: 'fatigued', name: 'Fatigued', icon: 'sleep', color: '#FF9500' },
      { id: 'lonely', name: 'Lonely', icon: 'account-heart', color: '#4BB38A' },
    ]
  };
  
  const [showUrgeModal, setShowUrgeModal] = useState(false);
  const [selectedUrgeOutcome, setSelectedUrgeOutcome] = useState(null);
  

  
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const user = auth.currentUser;
        if (user) {
          const userRef = doc(db, "users", user.uid);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            const data = userSnap.data();
            setUserData(data);
            // Check if mood was recorded today
            const today = new Date().toDateString();
            const todayMoodEntry = data.moods?.find(m => new Date(m.date).toDateString() === today);
            setTodayMood(todayMoodEntry?.mood || null);
          }
        }
      } catch (e) {
        console.log(e);
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
    handleCheckIn();
  }, []);
  
  const handleUrgeRecord = async (outcome, feeling) => {
    try {
      const user = auth.currentUser;
      if (!user) return;
      
      const userRef = doc(db, "users", user.uid);
      const urgeEntry = {
        outcome: outcome, // 'resisted' or 'relapsed'
        feeling: feeling.id,
        feelingName: feeling.name,
        date: new Date().toISOString(),
        timestamp: serverTimestamp(),
        hour: new Date().getHours()
      };
      
      await updateDoc(userRef, {
        urges: arrayUnion(urgeEntry)
      });
      
      setShowUrgeModal(false);
      setSelectedUrgeOutcome(null);
      ToastAndroid.show(`Urge ${outcome}: ${feeling.name}`, ToastAndroid.SHORT);
    } catch (e) {
      console.log(e);
      ToastAndroid.show("Failed to record urge", ToastAndroid.SHORT);
    }
  };
  
  const handleTriggerRecord = async (trigger) => {
    try {
      const user = auth.currentUser;
      if (!user) return;
      
      const userRef = doc(db, "users", user.uid);
      const triggerEntry = {
        trigger: trigger.id,
        triggerName: trigger.name,
        date: new Date().toISOString(),
        timestamp: serverTimestamp(),
        hour: new Date().getHours()
      };
      
      await updateDoc(userRef, {
        triggers: arrayUnion(triggerEntry)
      });
      
      setShowTriggerDropdown(false);
      ToastAndroid.show(`Trigger recorded: ${trigger.name}`, ToastAndroid.SHORT);
    } catch (e) {
      console.log(e);
      ToastAndroid.show("Failed to record trigger", ToastAndroid.SHORT);
    }
  };
  
  const handleCheckIn = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const data = userSnap.data();
        const lastCheckIn = data.lastCheckIn ? data.lastCheckIn.toDate() : null;
        const today = new Date();
        today.setHours(0, 0, 0, 0); // ignore time part

        let newStreak = 1; // default

        if (lastCheckIn) {
          const yesterday = new Date(today);
          yesterday.setDate(yesterday.getDate() - 1);

          if (lastCheckIn.toDateString() === today.toDateString()) {
            ToastAndroid.show("Already checked in today!", ToastAndroid.SHORT);
            return;
          } else if (lastCheckIn.toDateString() === yesterday.toDateString()) {
            newStreak = data.currentStreak + 1;
          }
        }

        const bestStreak = Math.max(newStreak, data.bestStreak || 0);

        // Check for badges
        let newBadges = [...(data.badges || [])];
        badgeMilestones.forEach((milestone) => {
          if (
            newStreak === milestone.days &&
            !newBadges.includes(milestone.name)
          ) {
            newBadges.push(milestone.name);
            ToastAndroid.show(
              `Congrats! You earned the "${milestone.name}" badge 🏆`,
              ToastAndroid.LONG
            );
          }
        });

        // Update Firestore with streaks + badges
        await updateDoc(userRef, {
          currentStreak: newStreak,
          bestStreak: bestStreak,
          lastCheckIn: serverTimestamp(),
          lastSuccessDate: today.toLocaleDateString(),
          badges: newBadges,
        });

        // Update local state
        setUserData({
          ...data,
          currentStreak: newStreak,
          bestStreak: bestStreak,
          lastCheckIn: today,
          lastSuccessDate: today.toLocaleDateString(),
          badges: newBadges,
        });

        ToastAndroid.show("Checked in! Keep it up!!", ToastAndroid.SHORT);
      }
    } catch (e) {
      console.log(e);
      ToastAndroid.show("Something went wrong", ToastAndroid.SHORT);
    }
  };

const handleDopamineSwapsPress = () => {
  // Path to the root-level screen
  router.push("/DopamineSwapsScreen");
};  const handleProgressPress = () => {
    // Navigate to detailed analytics
    ToastAndroid.show("Opening detailed analytics", ToastAndroid.SHORT);
    router.push("/AnalyticsScreen");
  };

  const displayName = userData?.displayName || "";
  const currentStreak = userData?.currentStreak ?? 0;
  const bestStreak = userData?.bestStreak ?? 0;
  const badges = userData?.badges || [];
  const lastSuccessDate = userData?.lastSuccessDate || "-";

  return (
    <SafeAreaView className="flex-1 bg-[#0f0f1e]">
      <StatusBar style="light" />
      <View className="flex-1 bg-[#0f0f1e] px-4 pt-4">
        {/* Header */}
        <View className="flex-row items-center mb-6">
          <View className="bg-[#1a1a2e] p-2 rounded-full mr-3">
            <Text className="text-white font-bold text-lg">RESOLVE</Text>
          </View>
          <View className="flex-1">
            <Text className="text-lg font-semibold text-white">
              
            </Text>
            <Text className="text-xs text-[#7a8b99]">
              {displayName ? `Welcome, ${displayName}` : ""}
            </Text>
          </View>
          <TouchableOpacity 
            className="ml-auto"
            onPress={() => router.push("/ProfileScreen")}
          >
            <View className="w-10 h-10 rounded-full bg-[#6C63FF] items-center justify-center">
              <MaterialCommunityIcons name="account" size={24} color="white" />
            </View>
          </TouchableOpacity>
        </View>
        
        <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
          {/* Daily Streak Card - Primary Element */}
          <LinearGradient
            colors={["#1a1a2e", "#0f0f1e"]}
            className="rounded-3xl overflow-hidden mb-6 shadow-lg"
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            {/* Top Gradient Header */}
            <LinearGradient
              colors={["#6C63FF", "#4BB38A"]}
              className="w-full p-4"
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <View className="flex-row justify-between items-center">
                <View>
                  <Text className="text-white text-xs font-semibold opacity-80">MILESTONE STREAK</Text>
                  <Text className="text-white text-2xl font-bold">{currentStreak} Days</Text>
                </View>
                <TouchableOpacity 
                  className="bg-white bg-opacity-20 p-2 rounded-full"
                  onPress={handleCheckIn}
                >
                  <MaterialCommunityIcons name="check" size={22} color="white" />
                </TouchableOpacity>
              </View>
            </LinearGradient>
            
            {/* Main Content */}
            <View className="p-6">
              {/* Time Counter with Animation */}
              <View className="flex-row items-end justify-center mb-6">
                <View className="items-center px-3">
                  <View className="w-16 h-16 rounded-xl bg-[#2d2d3a] items-center justify-center">
                    <Text className="text-white text-2xl font-bold">{currentStreak}</Text>
                  </View>
                  <Text className="text-[#7a8b99] text-xs mt-2">DAYS</Text>
                </View>
                
                <Text className="text-white text-xl mx-1 mb-3">:</Text>
                
                <View className="items-center px-3">
                  <View className="w-16 h-16 rounded-xl bg-[#2d2d3a] items-center justify-center">
                    <Text className="text-white text-2xl font-bold">{Math.floor(Math.random() * 24)}</Text>
                  </View>
                  <Text className="text-[#7a8b99] text-xs mt-2">HOURS</Text>
                </View>
                
                <Text className="text-white text-xl mx-1 mb-3">:</Text>
                
                <View className="items-center px-3">
                  <View className="w-16 h-16 rounded-xl bg-[#2d2d3a] items-center justify-center">
                    <Text className="text-white text-2xl font-bold">{Math.floor(Math.random() * 60)}</Text>
                  </View>
                  <Text className="text-[#7a8b99] text-xs mt-2">MINUTES</Text>
                </View>
              </View>
              
              {/* Comparison with previous best */}
              <View className="bg-[#2d2d3a] p-3 rounded-xl mb-6">
                <View className="flex-row justify-between">
                  <Text className="text-white">Best streak</Text>
                  <Text className="text-white font-bold">{bestStreak} days</Text>
                </View>
                <View className="w-full h-1.5 bg-[#1a1a2e] rounded-full mt-3">
                  <View 
                    className="h-1.5 rounded-full" 
                    style={{ 
                      width: `${Math.min(100, (currentStreak / Math.max(bestStreak, 1)) * 100)}%`,
                      backgroundColor: currentStreak >= bestStreak ? '#4BB38A' : '#6C63FF'
                    }}
                  />
                </View>
              </View>
              
              {/* Quick Actions - More Useful Tools */}
              <View className="space-y-3">
                <Text className="text-white font-semibold text-sm">Quick Actions</Text>
                <Text className="text-white font-semibold text-sm"></Text>
                
                {/* Emergency Support */}
                <TouchableOpacity 
                  className="flex-row items-center bg-[#FF658420] p-4 rounded-2xl"
                  onPress={() => router.push("/(tabs)/EmergencyScreen")}
                >
                  <View className="w-10 h-10 rounded-full bg-[#FF6584] items-center justify-center mr-3">
                    <MaterialCommunityIcons name="phone" size={20} color="white" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-white font-semibold">Emergency Support</Text>
                    <Text className="text-[#7a8b99] text-xs">Get immediate help when you need it</Text>
                  </View>
                  <MaterialCommunityIcons name="chevron-right" size={20} color="#FF6584" />
                </TouchableOpacity>
                
                {/* Community Support */}
                <TouchableOpacity 
                  className="flex-row items-center bg-[#4BB38A20] p-4 rounded-2xl"
                  onPress={() => router.push("/(tabs)/CommunityScreen")}
                >
                  <View className="w-10 h-10 rounded-full bg-[#4BB38A] items-center justify-center mr-3">
                    <MaterialCommunityIcons name="account-group" size={20} color="white" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-white font-semibold">Community Support</Text>
                    <Text className="text-[#7a8b99] text-xs">Connect with others on the same journey</Text>
                  </View>
                  <MaterialCommunityIcons name="chevron-right" size={20} color="#4BB38A" />
                </TouchableOpacity>
                
                {/* Progress Analytics */}
                <TouchableOpacity 
                  className="flex-row items-center bg-[#6C63FF20] p-4 rounded-2xl"
                  onPress={handleProgressPress}
                >
                  <View className="w-10 h-10 rounded-full bg-[#6C63FF] items-center justify-center mr-3">
                    <MaterialCommunityIcons name="chart-line" size={20} color="white" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-white font-semibold">View Analytics</Text>
                    <Text className="text-[#7a8b99] text-xs">See your detailed progress and patterns</Text>
                  </View>
                  <MaterialCommunityIcons name="chevron-right" size={20} color="#6C63FF" />
                </TouchableOpacity>
              </View>
            </View>
          </LinearGradient>

          {/* Urge Tracking - Primary Action */}
          <View className="mb-6">
            <LinearGradient
              colors={["#1a1a2e", "#0f0f1e"]}
              className="rounded-3xl p-5 mb-4"
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text className="text-white text-lg font-bold mb-4">Track Your Progress</Text>
              <View className="flex-row justify-between space-x-3">
                {/* Urge Resisted Button */}
                <TouchableOpacity 
                  className="flex-1 p-4 rounded-2xl"
                  style={{ backgroundColor: '#4BB38A20' }}
                  onPress={() => {
                    setSelectedUrgeOutcome('resisted');
                    setShowUrgeModal(true);
                  }}
                >
                  <View className="items-center">
                    <MaterialCommunityIcons name="shield-check" size={36} color="#4BB38A" />
                    <Text className="text-white text-sm font-bold mt-3">URGE RESISTED</Text>
                    <Text className="text-[#7a8b99] text-xs mt-1 text-center">You stayed strong!</Text>
                  </View>
                </TouchableOpacity>
                
                {/* Relapsed Button */}
                <TouchableOpacity 
                  className="flex-1 p-4 rounded-2xl"
                  style={{ backgroundColor: '#FF658420' }}
                  onPress={() => {
                    setSelectedUrgeOutcome('relapsed');
                    setShowUrgeModal(true);
                  }}
                >
                  <View className="items-center">
                    <MaterialCommunityIcons name="refresh" size={36} color="#FF6584" />
                    <Text className="text-white text-sm font-bold mt-3">RELAPSED</Text>
                    <Text className="text-[#7a8b99] text-xs mt-1 text-center">It's okay, keep going</Text>
                  </View>
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </View>

          {/* Recovery Progress - Enhanced with Analytics */}
          <TouchableOpacity 
            className="mb-6" 
            onPress={handleProgressPress}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={["#1a1a2e", "#0f0f1e"]}
              className="rounded-3xl overflow-hidden shadow-lg"
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              {/* Header */}
              <View className="px-5 pt-5 pb-3">
                <View className="flex-row justify-between items-center mb-2">
                  <Text className="text-white text-lg font-bold">Recovery Analytics</Text>
                  <View className="bg-[#4BB38A] bg-opacity-20 px-3 py-1 rounded-full">
                    <Text className="text-[#4BB38A] font-semibold text-xs">68.5% Success Rate</Text>
                  </View>
                </View>
                
                <Text className="text-[#7a8b99] text-xs">
                  Based on your recent progress and patterns
                </Text>
              </View>
              
              {/* Analytics Preview */}
              <View className="px-5 pt-2 pb-4">
                {/* Key Stats Row */}
                <View className="flex-row bg-[#2d2d3a] rounded-2xl p-4 mb-4">
                  <View className="flex-1 items-center">
                    <View className="w-12 h-12 rounded-full bg-[#4BB38A20] items-center justify-center mb-2">
                      <MaterialCommunityIcons name="shield-check" size={20} color="#4BB38A" />
                    </View>
                    <Text className="text-white text-lg font-bold">68%</Text>
                    <Text className="text-[#7a8b99] text-xs text-center">Urges Resisted</Text>
                  </View>
                  
                  <View className="w-px bg-[#1a1a2e] mx-2" />
                  
                  <View className="flex-1 items-center">
                    <View className="w-12 h-12 rounded-full bg-[#6C63FF20] items-center justify-center mb-2">
                      <MaterialCommunityIcons name="trending-up" size={20} color="#6C63FF" />
                    </View>
                    <Text className="text-white text-lg font-bold">+12%</Text>
                    <Text className="text-[#7a8b99] text-xs text-center">This Month</Text>
                  </View>
                  
                  <View className="w-px bg-[#1a1a2e] mx-2" />
                  
                  <View className="flex-1 items-center">
                    <View className="w-12 h-12 rounded-full bg-[#FF658420] items-center justify-center mb-2">
                      <MaterialCommunityIcons name="clock-alert" size={20} color="#FF6584" />
                    </View>
                    <Text className="text-white text-lg font-bold">11PM</Text>
                    <Text className="text-[#7a8b99] text-xs text-center">Risk Time</Text>
                  </View>
                </View>
                
                {/* Risk Assessment */}
                <View className="bg-[#FF658410] border border-[#FF658430] rounded-2xl p-3 mb-3">
                  <View className="flex-row items-center mb-1">
                    <MaterialCommunityIcons name="alert-circle" size={16} color="#FF6584" />
                    <Text className="text-[#FF6584] font-semibold text-sm ml-2">Risk Alert</Text>
                  </View>
                  <Text className="text-white text-xs">
                    You're most at risk when feeling 'anxious' around 11PM
                  </Text>
                </View>
                
                {/* Insight Card */}
                <View className="bg-[#4BB38A10] border border-[#4BB38A30] rounded-2xl p-3">
                  <View className="flex-row items-center mb-1">
                    <MaterialCommunityIcons name="lightbulb" size={16} color="#4BB38A" />
                    <Text className="text-[#4BB38A] font-semibold text-sm ml-2">Insight</Text>
                  </View>
                  <Text className="text-white text-xs">
                    Your resistance is strongest when feeling 'neutral' at 2PM
                  </Text>
                </View>
              </View>
              
              {/* Bottom Prompt */}
              <View className="flex-row justify-center items-center bg-[#2d2d3a] p-3">
                <Text className="text-white mr-2">View complete analytics dashboard</Text>
                <MaterialCommunityIcons name="chart-line" size={18} color="#6C63FF" />
              </View>
            </LinearGradient>
          </TouchableOpacity>

          {/* Additional Features */}
          <View className="mb-6">
            
            {/* Trigger Tracking */}
            <LinearGradient
              colors={["#1a1a2e", "#0f0f1e"]}
              className="rounded-3xl p-4 mb-4"
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View className="flex-row items-center justify-between mb-3">
                <Text className="text-white font-semibold">Feeling an urge?</Text>
                <TouchableOpacity 
                  className="bg-[#FF6584] px-4 py-2 rounded-full"
                  onPress={() => setShowTriggerDropdown(true)}
                >
                  <Text className="text-white text-sm font-semibold">Record Trigger</Text>
                </TouchableOpacity>
              </View>
              <Text className="text-[#7a8b99] text-xs">Track what triggers your urges to better understand patterns</Text>
            </LinearGradient>
            
            {/* Dopamine Swaps Button */}
            <TouchableOpacity onPress={handleDopamineSwapsPress}>
              <LinearGradient
                colors={["#6C63FF", "#4BB38A"]}
                className="rounded-3xl p-5 flex-row items-center"
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View className="w-12 h-12 rounded-full bg-white bg-opacity-20 items-center justify-center mr-4">
                  <MaterialCommunityIcons name="swap-horizontal" size={24} color="white" />
                </View>
                <View className="flex-1">
                  <Text className="text-white text-lg font-bold">Dopamine Swaps</Text>
                  <Text className="text-white text-sm opacity-80">Healthy alternatives to redirect your energy</Text>
                </View>
                <MaterialCommunityIcons name="chevron-right" size={24} color="white" />
              </LinearGradient>
            </TouchableOpacity>
          </View>
          
          {/* Urge Modal */}
          <Modal
            visible={showUrgeModal}
            transparent={true}
            animationType="fade"
            onRequestClose={() => setShowUrgeModal(false)}
          >
            <TouchableOpacity 
              className="flex-1 bg-black bg-opacity-50 justify-center items-center"
              onPress={() => setShowUrgeModal(false)}
            >
              <View className="bg-[#1a1a2e] rounded-3xl p-6 mx-4 w-80">
                <View className="items-center mb-4">
                  <MaterialCommunityIcons 
                    name={selectedUrgeOutcome === 'resisted' ? 'shield-check' : 'refresh'} 
                    size={40} 
                    color={selectedUrgeOutcome === 'resisted' ? '#4BB38A' : '#FF6584'} 
                  />
                  <Text className="text-white text-lg font-bold mt-2">
                    {selectedUrgeOutcome === 'resisted' ? 'URGE RESISTED' : 'RELAPSED'}
                  </Text>
                  <Text className="text-[#7a8b99] text-sm text-center mt-1">
                    How were you feeling?
                  </Text>
                </View>
                
                {/* Positive Feelings */}
                <Text className="text-white font-semibold mb-2">Positive</Text>
                <View className="flex-row justify-between mb-4">
                  {feelingOptions.positive.map((feeling) => (
                    <TouchableOpacity 
                      key={feeling.id}
                      className="flex-1 items-center p-3 mx-1 rounded-2xl"
                      style={{ backgroundColor: feeling.color + '20' }}
                      onPress={() => handleUrgeRecord(selectedUrgeOutcome, feeling)}
                    >
                      <MaterialCommunityIcons name={feeling.icon} size={24} color={feeling.color} />
                      <Text className="text-white text-xs mt-1">{feeling.name}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                
                {/* Negative Feelings */}
                <Text className="text-white font-semibold mb-2">Negative</Text>
                <View className="flex-row flex-wrap justify-between mb-4">
                  {feelingOptions.negative.map((feeling, index) => (
                    <TouchableOpacity 
                      key={feeling.id}
                      className="items-center p-3 rounded-2xl mb-2"
                      style={{ 
                        backgroundColor: feeling.color + '20',
                        width: '47%'
                      }}
                      onPress={() => handleUrgeRecord(selectedUrgeOutcome, feeling)}
                    >
                      <MaterialCommunityIcons name={feeling.icon} size={24} color={feeling.color} />
                      <Text className="text-white text-xs mt-1">{feeling.name}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                
                <TouchableOpacity 
                  className="mt-4 p-3 bg-[#2d2d3a] rounded-2xl"
                  onPress={() => {
                    setShowUrgeModal(false);
                    setSelectedUrgeOutcome(null);
                  }}
                >
                  <Text className="text-white text-center">Cancel</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </Modal>

          {/* Rewards & Gamification */}
          <View className="mb-6">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-white text-lg font-bold">Rewards</Text>
              <View className="flex-row items-center">
                <MaterialCommunityIcons name="star" size={16} color="#FFD700" />
                <Text className="text-white text-sm ml-1">{rewardPoints} points</Text>
              </View>
            </View>
            
            <LinearGradient
              colors={["#1a1a2e", "#0f0f1e"]}
              className="rounded-3xl p-5 shadow-lg"
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text className="text-white font-semibold mb-2">Progress to next reward</Text>
              <View className="w-full h-3 bg-[#2d2d3a] rounded-full mb-2">
                <LinearGradient
                  colors={["#6C63FF", "#4BB38A"]}
                  className="h-3 rounded-full"
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={{ width: `${(rewardPoints % 200) / 2}%` }}
                />
              </View>
              <Text className="text-[#7a8b99] text-xs">
                {200 - (rewardPoints % 200)} more points to unlock premium meditation
              </Text>
              
              <View className="flex-row flex-wrap justify-between mt-4">
                {badges.length > 0 ? (
                  badges.slice(0, 3).map((badge, idx) => (
                    <View key={idx} className="items-center mb-2">
                      <View className="w-12 h-12 rounded-full bg-[#2d2d3a] items-center justify-center mb-1">
                        <MaterialCommunityIcons 
                          name={idx === 0 ? "trophy" : idx === 1 ? "medal" : "star-circle"} 
                          size={24} 
                          color="#FFD700" 
                        />
                      </View>
                      <Text className="text-[#7a8b99] text-xs">{badge}</Text>
                    </View>
                  ))
                ) : (
                  <Text className="text-[#7a8b99] text-xs">Complete challenges to earn badges</Text>
                )}
              </View>
            </LinearGradient>
          </View>
          
          {/* Bottom padding to account for tab bar */}
          <View className="h-20" />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

