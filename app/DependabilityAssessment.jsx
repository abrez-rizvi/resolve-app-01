import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

const questions = [
  {
    section: "Usage Patterns",
    text: "In a typical week, how often do you watch pornography?",
    options: [
      { label: "Rarely, or not every week", points: 0 },
      { label: "1-3 times a week", points: 1 },
      { label: "4-6 times a week", points: 2 },
      { label: "Daily, or multiple times a day", points: 3 },
    ],
  },
  {
    section: "Usage Patterns",
    text: "When you do watch, how long does a typical session last?",
    options: [
      { label: "Less than 15 minutes", points: 0 },
      { label: "15 to 45 minutes", points: 1 },
      { label: "About an hour", points: 2 },
      { label: "More than an hour", points: 3 },
    ],
  },
  {
    section: "Loss of Control & Compulsivity",
    text: "Do you often find yourself watching porn for much longer than you originally intended?",
    options: [
      { label: "Never", points: 0 },
      { label: "Sometimes", points: 1 },
      { label: "Often", points: 2 },
      { label: "Almost every time", points: 3 },
    ],
  },
  {
    section: "Loss of Control & Compulsivity",
    text: "Have you tried to stop or cut down on watching, but found you couldn't?",
    options: [
      { label: "I have never tried to stop.", points: 1 },
      { label: "I've tried and it was manageable.", points: 2 },
      { label: "I've tried and it was very difficult.", points: 3 },
      { label: "I've tried multiple times and failed.", points: 4 },
    ],
  },
  {
    section: "Psychological Reliance & Triggers",
    text: "What is the most common reason you turn to pornography?",
    options: [
      { label: "Sexual curiosity or entertainment", points: 0 },
      { label: "Habit or boredom", points: 1 },
      { label: "To cope with stress or anxiety", points: 2 },
      { label: "To escape feelings of sadness, loneliness, or anger", points: 3 },
    ],
  },
  {
    section: "Psychological Reliance & Triggers",
    text: "After watching, how do you typically feel about yourself?",
    options: [
      { label: "Fine, or positive", points: 0 },
      { label: "Indifferent or empty", points: 1 },
      { label: "A little guilty or regretful", points: 2 },
      { label: "Overwhelmed with shame, anxiety, or disgust", points: 3 },
    ],
  },
  {
    section: "Negative Consequences",
    text: "Has your pornography use negatively affected your real-life relationships, work, or studies?",
    options: [
      { label: "No, I don't believe so.", points: 0 },
      { label: "It has caused minor issues or arguments.", points: 1 },
      { label: "It has caused significant problems (e.g., loss of focus, hiding the behavior).", points: 2 },
      { label: "It has directly damaged a relationship, my job, or my academic performance.", points: 3 },
    ],
  },
  {
    section: "Negative Consequences",
    text: "Do you find yourself thinking about pornography when you should be focusing on other things (like work, conversations, or hobbies)?",
    options: [
      { label: "Rarely or never", points: 0 },
      { label: "Sometimes", points: 1 },
      { label: "Often, it's distracting", points: 2 },
      { label: "Constantly, it's difficult to think about anything else", points: 3 },
    ],
  },
];

const scoreLevels = [
  {
    min: 0,
    max: 6,
    level: "Low Dependability",
    interpretation:
      "Your usage appears to be controlled and is likely not causing significant issues in your life. You may be here for curiosity or to build healthier habits.",
    action:
      "We recommend foundational content on mindful internet use, goal setting, and channel-switching techniques. The approach can be less intensive.",
  },
  {
    min: 7,
    max: 13,
    level: "Moderate Dependability",
    interpretation:
      "Your habit is becoming more established. You may be feeling a loss of control and experiencing some negative consequences. This is a crucial stage to build awareness and new coping mechanisms.",
    action:
      "We suggest a structured program, introduce CBT exercises for identifying triggers, and strongly encourage using the Urge Log and Community features.",
  },
  {
    min: 14,
    max: 20,
    level: "High Dependability",
    interpretation:
      "Your pornography use is likely a primary coping mechanism and is having a clear, negative impact on your life. The behavior may feel compulsive and difficult to manage on your own.",
    action:
      "We recommend a more intensive, structured daily plan. Prioritize features like accountability partners, emergency options, and advanced content on neuroscience and recovery. Consider resources for finding a therapist.",
  },
  {
    min: 21,
    max: 26,
    level: "Severe Dependability",
    interpretation:
      "Your relationship with pornography is causing significant distress and disruption. The behavior is likely compulsive, and you may feel powerless to stop. Professional help is strongly recommended.",
    action:
      "We recommend our most robust features immediately. Please seek professional help, such as therapists specializing in addiction, support groups (like SAA), and mental health hotlines.",
  },
];

export default function DependabilityAssessment() {
  const router = useRouter();
  const [answers, setAnswers] = useState(Array(questions.length).fill(null));
  const [current, setCurrent] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(null);

  const handleSelect = (optionIdx) => {
    const newAnswers = [...answers];
    newAnswers[current] = optionIdx;
    setAnswers(newAnswers);
    if (current < questions.length - 1) {
      setCurrent(current + 1);
    } else {
      // Calculate score
      const total = newAnswers.reduce((sum, idx, i) => {
        if (idx !== null) {
          return sum + questions[i].options[idx].points;
        }
        return sum;
      }, 0);
      setScore(total);
      // Find level
      const found = scoreLevels.find((lvl) => total >= lvl.min && total <= lvl.max);
      setLevel(found);
      setShowResult(true);
      // Save score to localStorage for HomeScreen
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem('dependabilityScore', total);
      }
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#0f0f1e]">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1 px-4 pt-8 pb-8 justify-center">
          {!showResult ? (
            <View>
              <Text className="text-white text-2xl font-bold mb-4 text-center">Adult Content Dependability Assessment</Text>
              <Text className="text-[#7a8b99] text-base mb-8 text-center">Question {current + 1} of {questions.length}</Text>
              <View className="bg-[#1a1a2e] rounded-2xl p-6 mb-6">
                <Text className="text-white text-lg font-semibold mb-2">{questions[current].section}</Text>
                <Text className="text-white text-base mb-4">{questions[current].text}</Text>
                {questions[current].options.map((opt, idx) => (
                  <TouchableOpacity
                    key={idx}
                    className="bg-[#FF6584] mb-3 py-3 px-4 rounded-xl"
                    style={{ opacity: answers[current] === idx ? 1 : 0.7, backgroundColor: answers[current] === idx ? '#4BB38A' : '#FF6584' }}
                    onPress={() => handleSelect(idx)}
                  >
                    <Text className="text-white text-base font-semibold">{opt.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ) : (
            <View className="items-center justify-center">
              <MaterialCommunityIcons name="clipboard-check" size={48} color="#4BB38A" />
              <Text className="text-white text-2xl font-bold mt-6 mb-2 text-center">Your Dependability Score</Text>
              <Text className="text-[#4BB38A] text-5xl font-extrabold mb-2">{score} / 26</Text>
              <Text className="text-white text-xl font-bold mb-2 text-center">{level?.level}</Text>
              <Text className="text-[#7a8b99] text-base mb-4 text-center">{level?.interpretation}</Text>
              <Text className="text-white text-base mb-6 text-center">{level?.action}</Text>
              <TouchableOpacity
                className="bg-[#FF6584] px-8 py-4 rounded-full mb-4"
                onPress={() => router.replace("/AnalyticsScreen")}
              >
                <Text className="text-white text-lg font-bold">Go to Analytics</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="bg-[#1a1a2e] px-8 py-4 rounded-full"
                onPress={() => router.replace("/HomeScreen")}
              >
                <Text className="text-white text-lg font-bold">Return Home</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
