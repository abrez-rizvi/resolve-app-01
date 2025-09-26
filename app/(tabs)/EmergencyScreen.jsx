import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { Linking, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function EmergencyScreen() {
  const [selectedCategory, setSelectedCategory] = useState('immediate');

  const emergencyResources = {
    immediate: [
      {
        id: 1,
        title: "Crisis Hotline",
        description: "24/7 support for immediate help",
        action: "Call Now",
        phone: "988",
        icon: "phone",
        color: "#FF6584"
      },
      {
        id: 2,
        title: "Emergency Meditation",
        description: "2-minute urge surfing technique",
        action: "Start Now",
        icon: "meditation",
        color: "#6C63FF"
      },
      {
        id: 3,
        title: "Call Accountability Partner",
        description: "Reach out for immediate support",
        action: "Call",
        phone: "emergency-contact",
        icon: "account-heart",
        color: "#4BB38A"
      },
      {
        id: 4,
        title: "Leave Environment",
        description: "Get outside immediately",
        action: "Go Now",
        icon: "run",
        color: "#FF9500"
      }
    ],
    coping: [
      {
        id: 5,
        title: "Breathing Exercise",
        description: "4-7-8 breathing technique",
        action: "Start",
        icon: "lungs",
        color: "#00C2FF"
      },
      {
        id: 6,
        title: "Cold Water",
        description: "Splash face or take cold shower",
        action: "Do It",
        icon: "water",
        color: "#6C63FF"
      },
      {
        id: 7,
        title: "Physical Exercise",
        description: "20 pushups or jumping jacks",
        action: "Start",
        icon: "dumbbell",
        color: "#FF6584"
      }
    ],
    longterm: [
      {
        id: 8,
        title: "Schedule Therapy",
        description: "Book professional help",
        action: "Book",
        icon: "calendar",
        color: "#4BB38A"
      },
      {
        id: 9,
        title: "Join Support Group",
        description: "Connect with recovery community",
        action: "Find Groups",
        icon: "account-group",
        color: "#FF9500"
      },
      {
        id: 10,
        title: "Set Content Filters",
        description: "Add blocking software",
        action: "Setup",
        icon: "shield-check",
        color: "#00C2FF"
      }
    ]
  };

  const handleResourcePress = (resource) => {
    if (resource.phone) {
      if (resource.phone === '988') {
        Linking.openURL('tel:988');
      } else {
        // Handle emergency contact calling
        console.log('Call emergency contact');
      }
    } else {
      console.log(`Starting ${resource.title}`);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#0f0f1e]">
      <StatusBar style="light" />
      <View className="flex-1 bg-[#0f0f1e] px-4 pt-4">
        {/* Header */}
        <View className="mb-6">
          <Text className="text-white text-2xl font-bold mb-2">Emergency Resources</Text>
          <Text className="text-[#7a8b99] text-sm">
            Immediate help when you need it most
          </Text>
        </View>

        {/* Category Tabs */}
        <View className="flex-row mb-6">
          <TouchableOpacity
            className={`flex-1 py-3 px-4 rounded-l-2xl ${
              selectedCategory === 'immediate' ? 'bg-[#FF6584]' : 'bg-[#1a1a2e]'
            }`}
            onPress={() => setSelectedCategory('immediate')}
          >
            <Text
              className={`text-center font-semibold ${
                selectedCategory === 'immediate' ? 'text-white' : 'text-[#7a8b99]'
              }`}
            >
              Immediate
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className={`flex-1 py-3 px-4 ${
              selectedCategory === 'coping' ? 'bg-[#6C63FF]' : 'bg-[#1a1a2e]'
            }`}
            onPress={() => setSelectedCategory('coping')}
          >
            <Text
              className={`text-center font-semibold ${
                selectedCategory === 'coping' ? 'text-white' : 'text-[#7a8b99]'
              }`}
            >
              Coping
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className={`flex-1 py-3 px-4 rounded-r-2xl ${
              selectedCategory === 'longterm' ? 'bg-[#4BB38A]' : 'bg-[#1a1a2e]'
            }`}
            onPress={() => setSelectedCategory('longterm')}
          >
            <Text
              className={`text-center font-semibold ${
                selectedCategory === 'longterm' ? 'text-white' : 'text-[#7a8b99]'
              }`}
            >
              Long-term
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {emergencyResources[selectedCategory].map((resource) => (
            <TouchableOpacity
              key={resource.id}
              className="bg-[#1a1a2e] rounded-2xl p-4 mb-4 flex-row items-center"
              onPress={() => handleResourcePress(resource)}
            >
              <View
                className="w-14 h-14 rounded-full items-center justify-center mr-4"
                style={{ backgroundColor: resource.color + '20' }}
              >
                <MaterialCommunityIcons
                  name={resource.icon}
                  size={28}
                  color={resource.color}
                />
              </View>
              <View className="flex-1">
                <Text className="text-white font-semibold text-lg mb-1">
                  {resource.title}
                </Text>
                <Text className="text-[#7a8b99] text-sm mb-2">
                  {resource.description}
                </Text>
              </View>
              <View
                className="px-4 py-2 rounded-full"
                style={{ backgroundColor: resource.color }}
              >
                <Text className="text-white font-semibold">{resource.action}</Text>
              </View>
            </TouchableOpacity>
          ))}

          {/* Emergency Warning */}
          <LinearGradient
            colors={["#FF6584", "#FF9500"]}
            className="rounded-2xl p-4 mt-4 mb-6"
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View className="flex-row items-center mb-2">
              <MaterialCommunityIcons name="alert" size={24} color="white" />
              <Text className="text-white font-bold text-lg ml-2">
                In Crisis?
              </Text>
            </View>
            <Text className="text-white/90 text-sm mb-3">
              If you're having thoughts of self-harm, please reach out immediately.
            </Text>
            <TouchableOpacity
              className="bg-white/20 py-2 px-4 rounded-full self-start"
              onPress={() => Linking.openURL('tel:988')}
            >
              <Text className="text-white font-semibold">Call 988 - Crisis Lifeline</Text>
            </TouchableOpacity>
          </LinearGradient>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}