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
  
  const moodOptions = [
    { id: 'good', name: 'Good', icon: 'emoticon-happy', color: '#4BB38A' },
    { id: 'neutral', name: 'Neutral', icon: 'emoticon-neutral', color: '#6C63FF' },
    { id: 'bad', name: 'Bad', icon: 'emoticon-sad', color: '#FF6584' },
  ];
  

  
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
  
  const handleMoodRecord = async (moodType) => {
    try {
      const user = auth.currentUser;
      if (!user) return;
      
      const userRef = doc(db, "users", user.uid);
      const today = new Date();
      const moodEntry = {
        mood: moodType,
        date: today.toISOString(),
        timestamp: serverTimestamp()
      };
      
      await updateDoc(userRef, {
        moods: arrayUnion(moodEntry)
      });
      
      setTodayMood(moodType);
      ToastAndroid.show(`Mood recorded: ${moodType}`, ToastAndroid.SHORT);
    } catch (e) {
      console.log(e);
      ToastAndroid.show("Failed to record mood", ToastAndroid.SHORT);
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
              
              {/* Action Buttons with Enhanced Design */}
              <View className="flex-row justify-between">
                <TouchableOpacity className="items-center bg-[#2d2d3a] p-3 rounded-xl flex-1 mx-1">
                  <MaterialCommunityIcons name="hand-back-left" size={22} color="#6C63FF" />
                  <Text className="text-white text-xs mt-1">Pledge</Text>
                </TouchableOpacity>
                
                <TouchableOpacity className="items-center bg-[#2d2d3a] p-3 rounded-xl flex-1 mx-1">
                  <MaterialCommunityIcons name="meditation" size={22} color="#4BB38A" />
                  <Text className="text-white text-xs mt-1">Meditate</Text>
                </TouchableOpacity>
                
                <TouchableOpacity className="items-center bg-[#2d2d3a] p-3 rounded-xl flex-1 mx-1">
                  <MaterialCommunityIcons name="music" size={22} color="#FF6584" />
                  <Text className="text-white text-xs mt-1">Music</Text>
                </TouchableOpacity>
                
                <TouchableOpacity className="items-center bg-[#2d2d3a] p-3 rounded-xl flex-1 mx-1">
                  <MaterialCommunityIcons name="dots-horizontal" size={22} color="#7a8b99" />
                  <Text className="text-white text-xs mt-1">More</Text>
                </TouchableOpacity>
              </View>
            </View>
          </LinearGradient>

          {/* Regiment Progress Score - Enhanced Version */}
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
                  <Text className="text-white text-lg font-bold">Recovery Progress</Text>
                  <View className="bg-[#6C63FF] bg-opacity-20 px-3 py-1 rounded-full">
                    <Text className="text-[#6C63FF] font-semibold text-xs">Level {Math.floor(progressScore/10) + 1}</Text>
                  </View>
                </View>
                
                <Text className="text-[#7a8b99] text-xs">
                  You've completed {progressScore}% of your recovery regiment
                </Text>
              </View>
              
              {/* Progress Visualization */}
              <View className="px-5 pt-2 pb-4">
                {/* Progress Bar with Milestones */}
                <View className="mb-4 mt-1">
                  <View className="w-full h-3 bg-[#2d2d3a] rounded-full">
                    <LinearGradient
                      colors={["#6C63FF", "#4BB38A"]}
                      className="h-3 rounded-full"
                      style={{ width: `${progressScore}%` }}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                    />
                  </View>
                  
                  {/* Milestone Markers */}
                  <View className="flex-row justify-between mt-1">
                    <View className="items-center">
                      <MaterialCommunityIcons 
                        name="flag-checkered" 
                        size={12} 
                        color={progressScore >= 25 ? "#4BB38A" : "#7a8b99"} 
                      />
                      <Text className="text-[#7a8b99] text-[10px]">25%</Text>
                    </View>
                    <View className="items-center">
                      <MaterialCommunityIcons 
                        name="flag-checkered" 
                        size={12} 
                        color={progressScore >= 50 ? "#4BB38A" : "#7a8b99"} 
                      />
                      <Text className="text-[#7a8b99] text-[10px]">50%</Text>
                    </View>
                    <View className="items-center">
                      <MaterialCommunityIcons 
                        name="flag-checkered" 
                        size={12} 
                        color={progressScore >= 75 ? "#4BB38A" : "#7a8b99"} 
                      />
                      <Text className="text-[#7a8b99] text-[10px]">75%</Text>
                    </View>
                    <View className="items-center">
                      <MaterialCommunityIcons 
                        name="trophy" 
                        size={12} 
                        color={progressScore >= 100 ? "#FFD700" : "#7a8b99"} 
                      />
                      <Text className="text-[#7a8b99] text-[10px]">100%</Text>
                    </View>
                  </View>
                </View>
                
                {/* Stats Display */}
                <View className="flex-row bg-[#2d2d3a] rounded-2xl p-3">
                  <View className="flex-1 items-center border-r border-[#1a1a2e]">
                    <View className="w-14 h-14 rounded-full border-4 border-[#6C63FF] items-center justify-center bg-[#1a1a2e]">
                      <Text className="text-white text-xl font-bold">{progressScore}%</Text>
                    </View>
                    <Text className="text-[#7a8b99] text-xs mt-1">Completed</Text>
                  </View>
                  
                  <View className="flex-1 items-center">
                    <View className="w-14 h-14 rounded-full items-center justify-center bg-[#1a1a2e]">
                      <MaterialCommunityIcons name="star" size={24} color="#FFD700" />
                      <Text className="text-white text-xs font-bold">{rewardPoints}</Text>
                    </View>
                    <Text className="text-[#7a8b99] text-xs mt-1">Points</Text>
                  </View>
                </View>
              </View>
              
              {/* Bottom Prompt with Animation Arrow */}
              <View className="flex-row justify-center items-center bg-[#2d2d3a] p-3">
                <Text className="text-white mr-2">Tap for detailed analytics</Text>
                <MaterialCommunityIcons name="arrow-right" size={18} color="#6C63FF" />
              </View>
            </LinearGradient>
          </TouchableOpacity>

          {/* Mood & Trigger Tracking */}
          <View className="mb-6">
            <Text className="text-white text-lg font-bold mb-4">How are you feeling?</Text>
            
            {/* Mood Buttons */}
            <LinearGradient
              colors={["#1a1a2e", "#0f0f1e"]}
              className="rounded-3xl p-4 mb-4"
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text className="text-white font-semibold mb-3">Record Your Mood</Text>
              <View className="flex-row justify-between">
                {moodOptions.map((mood) => (
                  <TouchableOpacity 
                    key={mood.id}
                    className={`flex-1 items-center p-3 mx-1 rounded-2xl ${
                      todayMood === mood.id ? 'opacity-100' : 'opacity-70'
                    }`}
                    style={{ backgroundColor: todayMood === mood.id ? mood.color + '40' : mood.color + '20' }}
                    onPress={() => handleMoodRecord(mood.id)}
                  >
                    <MaterialCommunityIcons name={mood.icon} size={28} color={mood.color} />
                    <Text className="text-white text-xs mt-1">{mood.name}</Text>
                    {todayMood === mood.id && (
                      <MaterialCommunityIcons name="check-circle" size={16} color={mood.color} className="mt-1" />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </LinearGradient>
            
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
          
          {/* Trigger Dropdown Modal */}
          <Modal
            visible={showTriggerDropdown}
            transparent={true}
            animationType="fade"
            onRequestClose={() => setShowTriggerDropdown(false)}
          >
            <TouchableOpacity 
              className="flex-1 bg-black bg-opacity-50 justify-center items-center"
              onPress={() => setShowTriggerDropdown(false)}
            >
              <View className="bg-[#1a1a2e] rounded-3xl p-6 mx-4 w-80">
                <Text className="text-white text-lg font-bold mb-4 text-center">What's triggering you?</Text>
                <View className="space-y-3">
                  {triggerOptions.map((trigger) => (
                    <TouchableOpacity 
                      key={trigger.id}
                      className="flex-row items-center p-3 rounded-2xl"
                      style={{ backgroundColor: trigger.color + '20' }}
                      onPress={() => handleTriggerRecord(trigger)}
                    >
                      <MaterialCommunityIcons name={trigger.icon} size={24} color={trigger.color} />
                      <Text className="text-white font-semibold ml-3 flex-1">{trigger.name}</Text>
                      <MaterialCommunityIcons name="chevron-right" size={20} color={trigger.color} />
                    </TouchableOpacity>
                  ))}
                </View>
                <TouchableOpacity 
                  className="mt-4 p-3 bg-[#2d2d3a] rounded-2xl"
                  onPress={() => setShowTriggerDropdown(false)}
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

