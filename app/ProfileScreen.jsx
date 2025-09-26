import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { Alert, Image, Modal, ScrollView, Switch, Text, ToastAndroid, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ResolveLogo from "../assets/images/resolve.png";
import { auth, db } from "../firebaseConfig";

// This screen is accessed from the top navbar, not through bottom tab navigation
export default function ProfileScreen() {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [notificationSettings, setNotificationSettings] = useState({
    dailyReminders: true,
    streakMilestones: true,
    motivationalQuotes: false,
    communityUpdates: true,
    emergencyAlerts: true,
  });
  const [appSettings, setAppSettings] = useState({
    darkMode: true,
    dataSync: true,
    analytics: true,
    soundEffects: false,
    hapticFeedback: true,
  });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const user = auth.currentUser;
        if (user) {
          const userRef = doc(db, "users", user.uid);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            setUserData(userSnap.data());
          }
        }
      } catch (e) {
        console.log(e);
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, []);

  const handleSignOut = () => {
    Alert.alert(
      "Sign Out",
      "Are you sure you want to sign out?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Sign Out",
          style: "destructive",
          onPress: async () => {
            try {
              await signOut(auth);
              router.replace("/LoginScreen");
            } catch (error) {
              console.error("Sign out error:", error);
            }
          },
        },
      ]
    );
  };

  const profileOptions = [
    {
      id: 1,
      title: "Account Settings",
      description: "Manage your account details",
      icon: "account-cog",
      color: "#6C63FF",
      action: () => setShowSettings(true)
    },
    {
      id: 2,
      title: "Notifications",
      description: "Configure app notifications",
      icon: "bell-outline",
      color: "#4BB38A",
      action: () => setShowNotifications(true)
    },
    {
      id: 3,
      title: "Privacy & Security",
      description: "Manage your privacy settings",
      icon: "shield-check",
      color: "#FF9500",
      action: () => ToastAndroid.show("Privacy settings coming soon", ToastAndroid.SHORT)
    },
    {
      id: 4,
      title: "Data Export",
      description: "Download your recovery data",
      icon: "download",
      color: "#00C2FF",
      action: () => ToastAndroid.show("Data export coming soon", ToastAndroid.SHORT)
    },
    {
      id: 5,
      title: "Help & Support",
      description: "Get help using the app",
      icon: "help-circle",
      color: "#FF6584",
      action: () => ToastAndroid.show("Support coming soon", ToastAndroid.SHORT)
    }
  ];

  const handleNotificationToggle = (key) => {
    setNotificationSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
    ToastAndroid.show("Notification setting updated", ToastAndroid.SHORT);
  };

  const handleSettingToggle = (key) => {
    setAppSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
    ToastAndroid.show("Setting updated", ToastAndroid.SHORT);
  };

  const displayName = userData?.displayName || "User";
  const email = userData?.email || auth.currentUser?.email || "No email";
  const currentStreak = userData?.currentStreak ?? 0;
  const bestStreak = userData?.bestStreak ?? 0;
  const badges = userData?.badges || [];
  const joinDate = userData?.createdAt ? new Date(userData.createdAt.seconds * 1000).toLocaleDateString() : "Recently";

  return (
    <SafeAreaView className="flex-1 bg-[#0f0f1e]">
      <StatusBar style="light" />
      <View className="flex-1 bg-[#0f0f1e] px-4 pt-4">
        {/* Header with back button */}
        <View className="flex-row items-center mb-6">
          <TouchableOpacity onPress={() => router.back()} className="mr-4">
            <MaterialCommunityIcons name="arrow-left" size={24} color="white" />
          </TouchableOpacity>
          <Text className="text-white text-2xl font-bold">Profile</Text>
        </View>
        
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Profile Header */}
          <LinearGradient
            colors={["#1a1a2e", "#0f0f1e"]}
            className="rounded-3xl p-6 mb-6"
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View className="items-center">
              {/* Profile Avatar */}
              <LinearGradient
                colors={["#6C63FF", "#4BB38A"]}
                className="w-24 h-24 rounded-full items-center justify-center mb-4"
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Image
                  source={ResolveLogo}
                  style={{ width: 48, height: 48 }}
                  className="tintColor-white"
                />
              </LinearGradient>
              
              <Text className="text-white text-2xl font-bold mb-1">{displayName}</Text>
              <Text className="text-[#7a8b99] text-sm mb-4">{email}</Text>
              
              {/* Quick Stats */}
              <View className="flex-row justify-between w-full">
                <View className="items-center flex-1">
                  <Text className="text-white text-2xl font-bold">{currentStreak}</Text>
                  <Text className="text-[#7a8b99] text-xs">Current Streak</Text>
                </View>
                <View className="items-center flex-1">
                  <Text className="text-white text-2xl font-bold">{bestStreak}</Text>
                  <Text className="text-[#7a8b99] text-xs">Best Streak</Text>
                </View>
                <View className="items-center flex-1">
                  <Text className="text-white text-2xl font-bold">{badges.length}</Text>
                  <Text className="text-[#7a8b99] text-xs">Badges</Text>
                </View>
              </View>
            </View>
          </LinearGradient>

          {/* Membership Info */}
          <View className="bg-[#1a1a2e] rounded-2xl p-4 mb-6 flex-row items-center">
            <MaterialCommunityIcons name="calendar-check" size={24} color="#4BB38A" />
            <View className="ml-3">
              <Text className="text-white font-semibold">Member Since</Text>
              <Text className="text-[#7a8b99] text-sm">{joinDate}</Text>
            </View>
          </View>

          {/* Profile Options */}
          <View className="mb-6">
            {profileOptions.map((option) => (
              <TouchableOpacity
                key={option.id}
                className="bg-[#1a1a2e] rounded-2xl p-4 mb-3 flex-row items-center"
                onPress={option.action}
              >
                <View
                  className="w-12 h-12 rounded-full items-center justify-center mr-4"
                  style={{ backgroundColor: option.color + '20' }}
                >
                  <MaterialCommunityIcons
                    name={option.icon}
                    size={24}
                    color={option.color}
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-white font-semibold">{option.title}</Text>
                  <Text className="text-[#7a8b99] text-xs">{option.description}</Text>
                </View>
                <MaterialCommunityIcons name="chevron-right" size={24} color="#7a8b99" />
              </TouchableOpacity>
            ))}
          </View>

          {/* Achievements Section */}
          {badges.length > 0 && (
            <View className="mb-6">
              <Text className="text-white text-lg font-bold mb-4">Recent Achievements</Text>
              {badges.slice(0, 3).map((badge, idx) => (
                <View
                  key={idx}
                  className="bg-[#1a1a2e] rounded-2xl p-4 mb-3 flex-row items-center"
                >
                  <LinearGradient
                    colors={["#FFD700", "#FF9500"]}
                    className="w-12 h-12 rounded-full items-center justify-center mr-4"
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <MaterialCommunityIcons name="trophy" size={24} color="white" />
                  </LinearGradient>
                  <View className="flex-1">
                    <Text className="text-white font-semibold">{badge}</Text>
                    <Text className="text-[#7a8b99] text-xs">Milestone Achievement</Text>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* Sign Out Button */}
          <TouchableOpacity
            className="bg-[#FF6584] rounded-2xl p-4 mb-8 flex-row items-center justify-center"
            onPress={handleSignOut}
          >
            <MaterialCommunityIcons name="logout" size={24} color="white" />
            <Text className="text-white font-semibold ml-2">Sign Out</Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Notifications Modal */}
        <Modal
          visible={showNotifications}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowNotifications(false)}
        >
          <View className="flex-1 bg-black bg-opacity-50 justify-end">
            <View className="bg-[#1a1a2e] rounded-t-3xl p-6 max-h-[80%]">
              <View className="flex-row items-center justify-between mb-6">
                <Text className="text-white text-xl font-bold">Notifications</Text>
                <TouchableOpacity onPress={() => setShowNotifications(false)}>
                  <MaterialCommunityIcons name="close" size={24} color="#7a8b99" />
                </TouchableOpacity>
              </View>
              
              <ScrollView showsVerticalScrollIndicator={false}>
                {Object.entries(notificationSettings).map(([key, value]) => {
                  const settingInfo = {
                    dailyReminders: { title: "Daily Check-in Reminders", description: "Get reminded to log your daily progress" },
                    streakMilestones: { title: "Streak Milestones", description: "Celebrate when you reach new streak goals" },
                    motivationalQuotes: { title: "Motivational Quotes", description: "Receive inspiring messages throughout the day" },
                    communityUpdates: { title: "Community Updates", description: "Stay updated with community activities" },
                    emergencyAlerts: { title: "Emergency Support", description: "Important alerts for crisis situations" },
                  };
                  
                  return (
                    <View key={key} className="flex-row items-center justify-between p-4 mb-2 bg-[#0f0f1e] rounded-2xl">
                      <View className="flex-1 mr-4">
                        <Text className="text-white font-semibold">{settingInfo[key].title}</Text>
                        <Text className="text-[#7a8b99] text-xs mt-1">{settingInfo[key].description}</Text>
                      </View>
                      <Switch
                        value={value}
                        onValueChange={() => handleNotificationToggle(key)}
                        trackColor={{ false: '#2d2d3a', true: '#4BB38A' }}
                        thumbColor={value ? '#ffffff' : '#7a8b99'}
                      />
                    </View>
                  );
                })}
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* Settings Modal */}
        <Modal
          visible={showSettings}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowSettings(false)}
        >
          <View className="flex-1 bg-black bg-opacity-50 justify-end">
            <View className="bg-[#1a1a2e] rounded-t-3xl p-6 max-h-[80%]">
              <View className="flex-row items-center justify-between mb-6">
                <Text className="text-white text-xl font-bold">Settings</Text>
                <TouchableOpacity onPress={() => setShowSettings(false)}>
                  <MaterialCommunityIcons name="close" size={24} color="#7a8b99" />
                </TouchableOpacity>
              </View>
              
              <ScrollView showsVerticalScrollIndicator={false}>
                {Object.entries(appSettings).map(([key, value]) => {
                  const settingInfo = {
                    darkMode: { title: "Dark Mode", description: "Use dark theme throughout the app" },
                    dataSync: { title: "Cloud Sync", description: "Automatically sync your data to the cloud" },
                    analytics: { title: "Usage Analytics", description: "Help improve the app by sharing anonymous usage data" },
                    soundEffects: { title: "Sound Effects", description: "Play sounds for actions and notifications" },
                    hapticFeedback: { title: "Haptic Feedback", description: "Feel vibrations for button presses and alerts" },
                  };
                  
                  return (
                    <View key={key} className="flex-row items-center justify-between p-4 mb-2 bg-[#0f0f1e] rounded-2xl">
                      <View className="flex-1 mr-4">
                        <Text className="text-white font-semibold">{settingInfo[key].title}</Text>
                        <Text className="text-[#7a8b99] text-xs mt-1">{settingInfo[key].description}</Text>
                      </View>
                      <Switch
                        value={value}
                        onValueChange={() => handleSettingToggle(key)}
                        trackColor={{ false: '#2d2d3a', true: '#6C63FF' }}
                        thumbColor={value ? '#ffffff' : '#7a8b99'}
                      />
                    </View>
                  );
                })}
                
                {/* Additional Settings Buttons */}
                <TouchableOpacity className="p-4 mb-2 bg-[#0f0f1e] rounded-2xl flex-row items-center">
                  <MaterialCommunityIcons name="palette" size={24} color="#FF9500" />
                  <View className="flex-1 ml-4">
                    <Text className="text-white font-semibold">Theme Customization</Text>
                    <Text className="text-[#7a8b99] text-xs">Customize app colors and appearance</Text>
                  </View>
                  <MaterialCommunityIcons name="chevron-right" size={20} color="#7a8b99" />
                </TouchableOpacity>
                
                <TouchableOpacity className="p-4 mb-2 bg-[#0f0f1e] rounded-2xl flex-row items-center">
                  <MaterialCommunityIcons name="database" size={24} color="#00C2FF" />
                  <View className="flex-1 ml-4">
                    <Text className="text-white font-semibold">Storage Management</Text>
                    <Text className="text-[#7a8b99] text-xs">Manage app data and cache</Text>
                  </View>
                  <MaterialCommunityIcons name="chevron-right" size={20} color="#7a8b99" />
                </TouchableOpacity>
              </ScrollView>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
}