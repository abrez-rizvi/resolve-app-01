import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { ScrollView, Text, ToastAndroid, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// This screen is accessed directly from HomeScreen, not through tab navigation
export default function DopamineSwapsScreen() {
  const [completedSwaps, setCompletedSwaps] = useState(new Set());
  
  const dopamineSwaps = [
    { 
      id: 1, 
      title: "Deep Breathing", 
      description: "5-minute breathing exercise", 
      detailedDescription: "Focus on your breath. Inhale for 4 counts, hold for 4, exhale for 6. Repeat for 5 minutes to activate your parasympathetic nervous system.",
      duration: "5 mins",
      icon: "lungs", 
      color: "#6C63FF",
      category: "breathing",
      benefits: ["Reduces anxiety", "Lowers heart rate", "Improves focus"]
    },
    { 
      id: 2, 
      title: "Quick Workout", 
      description: "10 pushups, 10 squats", 
      detailedDescription: "A burst of physical activity releases natural endorphins. Start with 10 pushups, then 10 squats. Feel the energy boost!",
      duration: "3 mins",
      icon: "dumbbell", 
      color: "#FF6584",
      category: "workout",
      benefits: ["Releases endorphins", "Boosts energy", "Improves mood"]
    },
    { 
      id: 3, 
      title: "Gratitude Journal", 
      description: "Write 3 things you're grateful for", 
      detailedDescription: "Take a moment to reflect on positive aspects of your life. Write down 3 specific things you're grateful for today.",
      duration: "4 mins",
      icon: "notebook", 
      color: "#4BB38A",
      category: "journaling",
      benefits: ["Shifts mindset", "Reduces stress", "Increases happiness"]
    },
    { 
      id: 4, 
      title: "Cold Shower", 
      description: "30-second cold exposure", 
      detailedDescription: "End your shower with 30 seconds of cold water. This activates your sympathetic nervous system and builds resilience.",
      duration: "30 secs",
      icon: "shower", 
      color: "#00C2FF",
      category: "wellness",
      benefits: ["Builds discipline", "Improves mood", "Boosts alertness"]
    },
    { 
      id: 5, 
      title: "Nature Walk", 
      description: "Step outside for fresh air", 
      detailedDescription: "A short walk outdoors can reset your mental state. Focus on the sights, sounds, and smells around you.",
      duration: "10 mins",
      icon: "tree", 
      color: "#4BB38A",
      category: "outdoor",
      benefits: ["Clears mind", "Vitamin D", "Light exercise"]
    },
    { 
      id: 6, 
      title: "Creative Expression", 
      description: "Draw, write, or play music", 
      detailedDescription: "Engage your creative side. Sketch something, write a poem, or play an instrument. Creative flow is naturally rewarding.",
      duration: "15 mins",
      icon: "palette", 
      color: "#FF9500",
      category: "creative",
      benefits: ["Stimulates brain", "Self-expression", "Flow state"]
    },
    { 
      id: 7, 
      title: "Social Connection", 
      description: "Call a friend or family member", 
      detailedDescription: "Human connection releases oxytocin. Reach out to someone you care about for a meaningful conversation.",
      duration: "10 mins",
      icon: "phone", 
      color: "#6C63FF",
      category: "social",
      benefits: ["Releases oxytocin", "Reduces isolation", "Builds relationships"]
    },
    { 
      id: 8, 
      title: "Learning", 
      description: "Read or watch educational content", 
      detailedDescription: "Feed your curiosity. Read an article, watch a documentary, or learn something new. Knowledge acquisition is inherently rewarding.",
      duration: "20 mins",
      icon: "book-open-variant", 
      color: "#4BB38A",
      category: "learning",
      benefits: ["Mental stimulation", "Personal growth", "Sense of achievement"]
    }
  ];

  const handleSwapComplete = (swapId) => {
    const newCompleted = new Set(completedSwaps);
    if (completedSwaps.has(swapId)) {
      newCompleted.delete(swapId);
      ToastAndroid.show("Marked as incomplete", ToastAndroid.SHORT);
    } else {
      newCompleted.add(swapId);
      ToastAndroid.show("Great job! Swap completed! 🎉", ToastAndroid.SHORT);
    }
    setCompletedSwaps(newCompleted);
  };

  const completedCount = completedSwaps.size;

  return (
    <SafeAreaView className="flex-1 bg-[#0f0f1e]">
      <StatusBar style="light" />
      <View className="flex-1 bg-[#0f0f1e] px-4 pt-4">
        {/* Header */}
        <View className="flex-row items-center mb-6">
          <TouchableOpacity onPress={() => router.back()} className="mr-4">
            <MaterialCommunityIcons name="arrow-left" size={24} color="white" />
          </TouchableOpacity>
          <Text className="text-white text-2xl font-bold flex-1">Dopamine Swaps</Text>
          <View className="flex-row items-center">
            <MaterialCommunityIcons name="check-circle" size={20} color="#4BB38A" />
            <Text className="text-white text-sm ml-1">{completedCount}/{dopamineSwaps.length}</Text>
          </View>
        </View>

        {/* Progress Bar */}
        <LinearGradient
          colors={["#1a1a2e", "#0f0f1e"]}
          className="rounded-3xl p-4 mb-6"
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View className="flex-row items-center mb-2">
            <Text className="text-white text-lg font-semibold flex-1">Today's Progress</Text>
            <Text className="text-[#4BB38A] text-sm font-bold">{Math.round((completedCount / dopamineSwaps.length) * 100)}%</Text>
          </View>
          <View className="w-full h-3 bg-[#2d2d3a] rounded-full">
            <LinearGradient
              colors={["#6C63FF", "#4BB38A"]}
              className="h-3 rounded-full"
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{ width: `${(completedCount / dopamineSwaps.length) * 100}%` }}
            />
          </View>
          <Text className="text-[#7a8b99] text-xs mt-2">
            {completedCount === 0 ? "Start your first swap!" : 
             completedCount === dopamineSwaps.length ? "All swaps completed! Amazing!" :
             `${dopamineSwaps.length - completedCount} more to go`}
          </Text>
        </LinearGradient>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
          {dopamineSwaps.map((swap) => {
            const isCompleted = completedSwaps.has(swap.id);
            
            return (
              <LinearGradient
                key={swap.id}
                colors={isCompleted ? ["#0f2027", "#203a43"] : ["#1a1a2e", "#0f0f1e"]}
                className="rounded-3xl p-5 mb-4"
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View className="flex-row items-start">
                  <View 
                    className="w-16 h-16 rounded-full items-center justify-center mr-4"
                    style={{ backgroundColor: swap.color + '20' }}
                  >
                    <MaterialCommunityIcons name={swap.icon} size={28} color={swap.color} />
                  </View>
                  
                  <View className="flex-1 mr-3">
                    <View className="flex-row items-center mb-1">
                      <Text className="text-white text-lg font-bold flex-1">{swap.title}</Text>
                      <View className="bg-[#2d2d3a] px-2 py-1 rounded-lg">
                        <Text className="text-[#7a8b99] text-xs">{swap.duration}</Text>
                      </View>
                    </View>
                    
                    <Text className="text-[#7a8b99] text-sm mb-3">{swap.detailedDescription}</Text>
                    
                    {/* Benefits */}
                    <View className="flex-row flex-wrap mb-3">
                      {swap.benefits.map((benefit, index) => (
                        <View key={index} className="bg-[#2d2d3a] px-2 py-1 rounded-lg mr-2 mb-1">
                          <Text className="text-[#7a8b99] text-xs">{benefit}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                  
                  <TouchableOpacity
                    onPress={() => handleSwapComplete(swap.id)}
                    className={`w-12 h-12 rounded-full items-center justify-center ${
                      isCompleted ? 'bg-[#4BB38A]' : 'bg-[#2d2d3a]'
                    }`}
                  >
                    <MaterialCommunityIcons 
                      name={isCompleted ? "check" : "plus"} 
                      size={20} 
                      color={isCompleted ? "white" : "#7a8b99"} 
                    />
                  </TouchableOpacity>
                </View>
              </LinearGradient>
            );
          })}
          
          {/* Motivational message at the bottom */}
          <LinearGradient
            colors={["#1a1a2e", "#0f0f1e"]}
            className="rounded-3xl p-5 mt-2"
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View className="items-center">
              <MaterialCommunityIcons name="lightbulb" size={24} color="#FFD700" />
              <Text className="text-white text-lg font-bold mt-2 mb-2">Pro Tip</Text>
              <Text className="text-[#7a8b99] text-sm text-center">
                The best time to do a dopamine swap is right when you feel an urge. 
                These activities naturally release feel-good chemicals in your brain !
              </Text>
            </View>
          </LinearGradient>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}