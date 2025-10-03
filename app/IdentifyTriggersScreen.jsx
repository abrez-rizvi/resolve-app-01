import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const questions = [
  {
    id: 1,
    title: "The Emotional Cue",
    description: "Think about the last time you felt a strong, almost automatic urge to open a social media app. What was your primary feeling right before you picked up your phone?",
    options: [
      { id: 'A', text: 'Bored or Unstimulated', subtitle: '"I had nothing else to do."', trigger: 'boredom' },
      { id: 'B', text: 'Stressed or Anxious', subtitle: '"I needed a distraction from pressure or worry."', trigger: 'stress' },
      { id: 'C', text: 'Lonely or Disconnected', subtitle: '"I wanted to see what others were up to."', trigger: 'loneliness' },
      { id: 'D', text: 'Tired or Fatigued', subtitle: '"I didn\'t have the energy for anything else."', trigger: 'fatigue' },
      { id: 'E', text: 'Avoidant', subtitle: '"I was putting off a task I didn\'t want to do."', trigger: 'avoidance' }
    ]
  },
  {
    id: 2,
    title: "The Environmental Cue",
    description: "Consider your physical surroundings when you're most likely to get lost in a scroll session. What in your environment typically triggers you?",
    options: [
      { id: 'A', text: 'A Specific Location', subtitle: '"Like being in bed, on the couch, or at my work desk."', trigger: 'location' },
      { id: 'B', text: 'A Notification', subtitle: '"A sound, buzz, or banner on my screen is impossible to ignore."', trigger: 'notifications' },
      { id: 'C', text: 'Seeing My Phone', subtitle: '"Just having my phone visible on the table or in my hand is the trigger."', trigger: 'phone_visibility' },
      { id: 'D', text: 'Seeing Others on Their Phones', subtitle: '"When friends or people around me are scrolling, I do too."', trigger: 'social_trigger' }
    ]
  },
  {
    id: 3,
    title: "The Situational Cue",
    description: "Urges often strike during specific moments in our day. Which of these 'in-between' moments is your biggest trap?",
    options: [
      { id: 'A', text: 'Waiting', subtitle: '"In a line, waiting for a friend, or for my food/coffee."', trigger: 'waiting' },
      { id: 'B', text: 'Transitioning', subtitle: '"The short break between finishing one task and starting another."', trigger: 'transition' },
      { id: 'C', text: 'Eating Alone', subtitle: '"I use my phone for company during meals."', trigger: 'eating_alone' },
      { id: 'D', text: 'Commuting', subtitle: '"On the bus, train, or as a passenger in a car."', trigger: 'commuting' }
    ]
  },
  {
    id: 4,
    title: "The Time-Based Cue",
    description: "Our habits are often tied to the clock. When does the urge to scroll feel the strongest and most automatic?",
    options: [
      { id: 'A', text: 'First Thing in the Morning', subtitle: '"I check my phone before I even get out of bed."', trigger: 'morning' },
      { id: 'B', text: 'During a Mid-day Slump', subtitle: '"Around lunch or in the mid-afternoon when my energy dips."', trigger: 'midday' },
      { id: 'C', text: 'Right After Work/School', subtitle: '"It\'s my primary way to decompress and switch off my brain."', trigger: 'after_work' },
      { id: 'D', text: 'Late at Night', subtitle: '"Scrolling in bed is the last thing I do before trying to sleep."', trigger: 'night' }
    ]
  },
  {
    id: 5,
    title: "The Preceding Action Cue",
    description: "Sometimes, one action directly leads to another. What action most often comes immediately before you start scrolling?",
    options: [
      { id: 'A', text: 'Finishing a Work Task', subtitle: '"I use it as a \'reward\' for being productive."', trigger: 'task_completion' },
      { id: 'B', text: 'Ending a Conversation', subtitle: '"After a call or in-person chat, I immediately check my phone."', trigger: 'conversation_end' },
      { id: 'C', text: 'Putting Down a Book or Turning Off the TV', subtitle: '"I switch from one form of media to another."', trigger: 'media_switch' },
      { id: 'D', text: 'Unlocking My Phone for Another Reason', subtitle: '"I\'ll pick it up to check the weather, and end up on social media."', trigger: 'phone_unlock' }
    ]
  }
];

const triggerInsights = {
  boredom: {
    title: "Boredom",
    description: "You use scrolling to fill empty moments. The key is to have alternatives ready before boredom strikes.",
    tip: "Create a 'Boredom-Buster' list. Write down 5 things you can do in under 5 minutes (e.g., stretch, tidy one surface, listen to one song, step outside). Keep it visible.",
    icon: "clock-outline",
    color: "#FF6584"
  },
  stress: {
    title: "Stress/Anxiety",
    description: "You turn to scrolling as an escape from pressure and overwhelming feelings.",
    tip: "Practice the 4-7-8 breathing technique: Breathe in for 4, hold for 7, exhale for 8. This activates your relaxation response naturally.",
    icon: "emoticon-stressed",
    color: "#6C63FF"
  },
  loneliness: {
    title: "Loneliness",
    description: "You seek connection and social validation through digital interactions.",
    tip: "Schedule one real social interaction daily - text a friend, call family, or smile at a neighbor. Quality over quantity.",
    icon: "account-heart",
    color: "#4BB38A"
  },
  fatigue: {
    title: "Fatigue",
    description: "When energy is low, scrolling becomes your default low-effort activity.",
    tip: "Create a 'Low Energy' toolkit: herbal tea, 5-minute power nap, gentle stretching, or listening to uplifting music.",
    icon: "sleep",
    color: "#FF9500"
  },
  avoidance: {
    title: "Avoidance",
    description: "Scrolling becomes a procrastination tool to delay difficult or uncomfortable tasks.",
    tip: "Use the 2-minute rule: If a task takes less than 2 minutes, do it immediately. For larger tasks, commit to just 10 minutes.",
    icon: "shield-off",
    color: "#FF6584"
  },
  location: {
    title: "Specific Locations",
    description: "Certain physical spaces have become strongly associated with your scrolling habits.",
    tip: "Redesign your trigger spaces. Move furniture, add plants, or designate these areas as 'phone-free zones' with visible reminders.",
    icon: "map-marker",
    color: "#6C63FF"
  },
  notifications: {
    title: "Notifications",
    description: "Digital alerts hijack your attention and pull you into endless scrolling sessions.",
    tip: "Turn off non-essential notifications. Use 'Do Not Disturb' mode during focus time and check messages at scheduled intervals.",
    icon: "bell-off",
    color: "#FF9500"
  },
  phone_visibility: {
    title: "Phone Visibility",
    description: "The mere presence of your phone is a powerful visual cue that triggers usage.",
    tip: "Practice 'out of sight, out of mind.' Place your phone in a drawer or another room when you need to focus. Set specific check-in times.",
    icon: "cellphone-off",
    color: "#4BB38A"
  },
  social_trigger: {
    title: "Social Triggers",
    description: "You mirror the behavior of people around you when they use their phones.",
    tip: "Be the change you want to see. Keep your phone away in social settings and engage more actively in conversations.",
    icon: "account-group",
    color: "#6C63FF"
  }
};

export default function IdentifyTriggersScreen() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [primaryTriggers, setPrimaryTriggers] = useState([]);

  const handleAnswer = (option) => {
    const newAnswers = {
      ...answers,
      [questions[currentQuestion].id]: option
    };
    setAnswers(newAnswers);

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // Calculate results
      calculateTriggers(newAnswers);
    }
  };

  const calculateTriggers = (allAnswers) => {
    const triggerCounts = {};
    
    Object.values(allAnswers).forEach(answer => {
      const trigger = answer.trigger;
      triggerCounts[trigger] = (triggerCounts[trigger] || 0) + 1;
    });

    // Get top 3 triggers
    const topTriggers = Object.entries(triggerCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([trigger]) => trigger);

    setPrimaryTriggers(topTriggers);
    setShowResults(true);
  };

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setAnswers({});
    setShowResults(false);
    setPrimaryTriggers([]);
  };

  if (showResults) {
    return (
      <SafeAreaView className="flex-1 bg-[#0f0f1e]">
        <StatusBar style="light" />
        <View className="flex-1 bg-[#0f0f1e] px-4 pt-4">
          {/* Header */}
          <View className="flex-row items-center mb-6">
            <TouchableOpacity 
              className="mr-4"
              onPress={() => router.back()}
            >
              <MaterialCommunityIcons name="arrow-left" size={24} color="white" />
            </TouchableOpacity>
            <Text className="text-white text-2xl font-bold flex-1">Your Trigger Profile</Text>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Results Header */}
            <LinearGradient
              colors={["#6C63FF", "#4BB38A"]}
              className="rounded-3xl p-6 mb-6"
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View className="items-center">
                <MaterialCommunityIcons name="target" size={48} color="white" />
                <Text className="text-white text-2xl font-bold mt-3 text-center">
                  Triggers Identified!
                </Text>
                <Text className="text-white text-sm mt-2 text-center opacity-90">
                  Here's your personalized trigger profile based on your responses
                </Text>
              </View>
            </LinearGradient>

            {/* Primary Triggers */}
            {primaryTriggers.map((triggerKey, index) => {
              const trigger = triggerInsights[triggerKey];
              if (!trigger) return null;

              return (
                <LinearGradient
                  key={triggerKey}
                  colors={["#1a1a2e", "#0f0f1e"]}
                  className="rounded-3xl p-5 mb-6"
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <View className="flex-row items-start mb-4">
                    <View 
                      className="w-12 h-12 rounded-full items-center justify-center mr-4"
                      style={{ backgroundColor: trigger.color + '20' }}
                    >
                      <MaterialCommunityIcons 
                        name={trigger.icon} 
                        size={24} 
                        color={trigger.color} 
                      />
                    </View>
                    <View className="flex-1">
                      <View className="flex-row items-center mb-2">
                        <Text className="text-white text-lg font-bold">
                          {index === 0 ? 'Primary' : index === 1 ? 'Secondary' : 'Third'} Trigger:
                        </Text>
                        <Text 
                          className="text-lg font-bold ml-2"
                          style={{ color: trigger.color }}
                        >
                          {trigger.title}
                        </Text>
                      </View>
                      <Text className="text-[#7a8b99] text-sm mb-3">
                        {trigger.description}
                      </Text>
                      
                      <View className="bg-[#2d2d3a] rounded-2xl p-3">
                        <View className="flex-row items-center mb-2">
                          <MaterialCommunityIcons name="lightbulb" size={16} color="#4BB38A" />
                          <Text className="text-[#4BB38A] font-semibold text-sm ml-2">
                            Actionable Tip
                          </Text>
                        </View>
                        <Text className="text-white text-sm">
                          {trigger.tip}
                        </Text>
                      </View>
                    </View>
                  </View>
                </LinearGradient>
              );
            })}

            {/* Action Buttons */}
            <View className="space-y-4 mb-8">
              <TouchableOpacity onPress={resetQuiz}>
                <LinearGradient
                  colors={["#6C63FF", "#4BB38A"]}
                  className="rounded-3xl p-4"
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Text className="text-white text-center font-bold">Retake Assessment</Text>
                </LinearGradient>
              </TouchableOpacity>
              
              <TouchableOpacity 
                className="bg-[#1a1a2e] rounded-3xl p-4"
                onPress={() => router.back()}
              >
                <Text className="text-white text-center font-bold">Back to Home</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-[#0f0f1e]">
      <StatusBar style="light" />
      <View className="flex-1 bg-[#0f0f1e] px-4 pt-4">
        {/* Header */}
        <View className="flex-row items-center mb-6">
          <TouchableOpacity 
            className="mr-4"
            onPress={() => router.back()}
          >
            <MaterialCommunityIcons name="arrow-left" size={24} color="white" />
          </TouchableOpacity>
          <Text className="text-white text-2xl font-bold flex-1">Identify Your Triggers</Text>
          <Text className="text-[#7a8b99] text-sm">{currentQuestion + 1}/{questions.length}</Text>
        </View>

        {/* Progress Bar */}
        <View className="w-full h-2 bg-[#1a1a2e] rounded-full mb-8">
          <LinearGradient
            colors={["#6C63FF", "#4BB38A"]}
            className="h-2 rounded-full"
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
          />
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Question Card */}
          <LinearGradient
            colors={["#1a1a2e", "#0f0f1e"]}
            className="rounded-3xl p-6 mb-6"
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text className="text-[#6C63FF] text-sm font-semibold mb-2">
              Question {currentQuestion + 1}: {questions[currentQuestion].title}
            </Text>
            <Text className="text-white text-lg font-medium leading-6">
              {questions[currentQuestion].description}
            </Text>
          </LinearGradient>

          {/* Answer Options */}
          <View className="space-y-4 mb-8">
            {questions[currentQuestion].options.map((option) => (
              <TouchableOpacity
                key={option.id}
                className="bg-[#1a1a2e] rounded-2xl p-5 border-2 border-transparent active:border-[#6C63FF]"
                onPress={() => handleAnswer(option)}
              >
                <View className="flex-row items-start">
                  <View className="w-8 h-8 rounded-full bg-[#6C63FF] items-center justify-center mr-4 mt-1">
                    <Text className="text-white font-bold">{option.id}</Text>
                  </View>
                  <View className="flex-1">
                    <Text className="text-white text-lg font-semibold mb-1">
                      {option.text}
                    </Text>
                    <Text className="text-[#7a8b99] text-sm">
                      {option.subtitle}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}