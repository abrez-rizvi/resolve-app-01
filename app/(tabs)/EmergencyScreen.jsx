import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import { useEffect, useRef, useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";


export default function EmergencyScreen() {
  const [panicMode, setPanicMode] = useState(false);
  const [timer, setTimer] = useState(300); // 5 minutes in seconds
  const timerRef = useRef();

  useEffect(() => {
    if (panicMode && timer > 0) {
      timerRef.current = setTimeout(() => setTimer(timer - 1), 1000);
    }
    return () => clearTimeout(timerRef.current);
  }, [panicMode, timer]);

  // High contrast Panic Mode screen
  if (panicMode) {
    const minutes = Math.floor(timer / 60);
    const seconds = timer % 60;
    return (
      <SafeAreaView className="flex-1">
        <LinearGradient
          colors={["#FF6584", "#FF9500", "#6C63FF"]}
          className="flex-1 justify-center items-center"
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <StatusBar style="light" />
          <View className="items-center justify-center">
            <MaterialCommunityIcons name="alert-circle" size={64} color="#fff" />
            <Text className="text-white text-3xl font-extrabold mt-6 mb-2 text-center" style={{ textShadowColor: '#000', textShadowRadius: 8 }}>DON'T RELAPSE</Text>
            <Text className="text-white text-xl font-bold mb-6 text-center">Stay strong. This feeling will pass.</Text>
            <Text className="text-white text-2xl font-bold mb-2">Time Remaining</Text>
            <Text className="text-white text-4xl font-extrabold mb-8" style={{ letterSpacing: 2 }}>{minutes}:{seconds.toString().padStart(2, '0')}</Text>
            <Text className="text-white text-lg font-semibold mb-8 text-center">You cannot leave this screen until the timer is up.</Text>
            <TouchableOpacity
              disabled={timer > 0}
              className={`px-8 py-4 rounded-full ${timer > 0 ? 'bg-gray-400' : 'bg-[#4BB38A]'}`}
              style={{ opacity: timer > 0 ? 0.5 : 1 }}
              onPress={() => {
                setPanicMode(false);
                setTimer(300);
              }}
            >
              <Text className="text-white text-xl font-bold">Return to Safety</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  // Main Emergency Resources page
  return (
    <SafeAreaView className="flex-1 bg-[#0f0f1e]">
      <StatusBar style="light" />
      <View className="flex-1 bg-[#0f0f1e] px-4 pt-4">
        {/* Header */}
        <View className="mb-8 mt-4 items-center">
          <MaterialCommunityIcons name="alert-circle" size={48} color="#FF6584" />
          <Text className="text-white text-3xl font-extrabold mt-4 mb-2 text-center">Panic Mode</Text>
          <Text className="text-[#FF6584] text-lg font-bold mb-2 text-center">If you feel an urge, enter Panic Mode.</Text>
          <Text className="text-[#7a8b99] text-base text-center">This will help you stay strong and prevent relapse.</Text>
        </View>

        <TouchableOpacity
          className="bg-[#FF6584] rounded-2xl p-6 mb-8 flex-row items-center justify-center"
          onPress={() => setPanicMode(true)}
        >
          <MaterialCommunityIcons name="lock" size={32} color="white" />
          <Text className="text-white text-xl font-bold ml-4">Enter Panic Mode</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="bg-[#4BB38A] rounded-2xl p-6 mb-8 flex-row items-center justify-center"
          onPress={() => {
            // Use Expo Router navigation for all platforms
            try {
              const { router } = require('expo-router');
              router.push('/DopamineSwapsScreen');
            } catch (e) {
              // Fallback for web
              if (typeof window !== 'undefined') {
                window.location.href = '/DopamineSwapsScreen';
              }
            }
          }}
        >
          <MaterialCommunityIcons name="swap-horizontal" size={32} color="white" />
          <Text className="text-white text-xl font-bold ml-4">Go to Dopamine Swaps</Text>
        </TouchableOpacity>

        <View className="flex-1" />
      </View>
    </SafeAreaView>
  );
}