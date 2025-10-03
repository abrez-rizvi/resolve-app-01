import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import { doc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { Dimensions, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { auth, db } from "../../firebaseConfig";

const { width: screenWidth } = Dimensions.get('window');

// Generate mock calendar data for the current month
const generateCalendarData = () => {
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  
  const calendarData = {};
  
  // Generate random activity for each day
  for (let day = 1; day <= daysInMonth; day++) {
    const hasActivity = Math.random() > 0.3; // 70% chance of activity
    if (hasActivity) {
      const urges = Math.floor(Math.random() * 5) + 1;
      const resisted = Math.floor(Math.random() * urges) + Math.floor(urges * 0.6);
      calendarData[day] = {
        urges,
        resisted,
        relapsed: urges - resisted,
        streak: Math.floor(Math.random() * 30),
        feeling: ['neutral', 'bored', 'stressed', 'anxious', 'sad'][Math.floor(Math.random() * 5)]
      };
    }
  }
  
  return { calendarData, daysInMonth, firstDay, currentMonth, currentYear };
};

// Generate mock weekly activity data
const generateWeeklyActivityData = () => {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  return days.map(day => ({
    day,
    urges: Math.floor(Math.random() * 8) + 1,
    resisted: Math.floor(Math.random() * 6) + 3,
    relapsed: Math.floor(Math.random() * 3),
    mood: Math.floor(Math.random() * 5) + 1 // 1-5 scale
  }));
};

// Mock data based on analysis.py structure - in production this would come from running the Python script
const mockAnalysisData = {
  event_level: {
    urge_outcome_rate: {
      resisted_pct: 68.5,
      relapsed_pct: 31.5
    },
    feeling_to_outcome_correlation: {
      "bored": 45.2,
      "stressed": 28.3,
      "anxious": 52.1,
      "neutral": 22.4,
      "sad": 38.7,
      "angry": 41.6
    },
    feeling_strength_index: {
      "bored": 1.43,
      "stressed": 0.90,
      "anxious": 1.65,
      "neutral": 0.71,
      "sad": 1.23,
      "angry": 1.32
    }
  },
  time_based: {
    peak_relapse_hours: [23, 0, 1], // 11pm, 12am, 1am
    peak_resistance_hours: [10, 14, 18], // 10am, 2pm, 6pm
    relapse_by_day_of_week: {
      "Saturday": 28.6,
      "Friday": 26.4,
      "Sunday": 24.1,
      "Monday": 22.8,
      "Thursday": 21.3,
      "Tuesday": 19.7,
      "Wednesday": 18.2
    },
    recovery_progress_over_time_pct: {
      "2025-07": 52.4,
      "2025-08": 61.2,
      "2025-09": 68.5
    }
  },
  commitment: {
    commitment_score_rolling_30d_avg: 68.5,
    avg_time_to_relapse_hours: 72.5
  },
  feeling_dynamics: {
    most_vulnerable_feeling: "anxious",
    most_protective_feeling: "neutral"
  },
  user_feedback_loops: {
    personalized_risk_profile: "You're most at risk (52%) of relapsing when feeling 'anxious' during hour 23."
  }
};

// Pie Chart Component
const PieChart = ({ resisted, relapsed, size = 120 }) => {
  const total = resisted + relapsed;
  const resistedAngle = (resisted / total) * 360;
  const relapsedAngle = (relapsed / total) * 360;
  
  return (
    <View className="items-center">
      <View 
        className="rounded-full items-center justify-center border-8"
        style={{ 
          width: size, 
          height: size,
          borderColor: '#4BB38A',
          borderRightColor: '#FF6584',
          borderTopColor: relapsedAngle > 180 ? '#FF6584' : '#4BB38A',
          borderBottomColor: relapsedAngle > 270 ? '#FF6584' : '#4BB38A',
          borderLeftColor: relapsedAngle > 90 ? '#FF6584' : '#4BB38A',
          transform: [{ rotate: `${-90 + (relapsedAngle / 2)}deg` }]
        }}
      >
        <View style={{ transform: [{ rotate: `${90 - (relapsedAngle / 2)}deg` }] }}>
          <Text className="text-white text-2xl font-bold">{resisted.toFixed(0)}%</Text>
          <Text className="text-[#7a8b99] text-xs text-center">Resisted</Text>
        </View>
      </View>
      <View className="flex-row items-center mt-3">
        <View className="flex-row items-center mr-4">
          <View className="w-3 h-3 rounded-full bg-[#4BB38A] mr-2" />
          <Text className="text-[#7a8b99] text-xs">Resisted ({resisted.toFixed(1)}%)</Text>
        </View>
        <View className="flex-row items-center">
          <View className="w-3 h-3 rounded-full bg-[#FF6584] mr-2" />
          <Text className="text-[#7a8b99] text-xs">Relapsed ({relapsed.toFixed(1)}%)</Text>
        </View>
      </View>
    </View>
  );
};

// Heatmap Component for Feelings vs Outcome
const FeelingsHeatmap = ({ data }) => {
  const feelings = Object.keys(data);
  const maxValue = Math.max(...Object.values(data));
  
  return (
    <View className="flex-row flex-wrap justify-between">
      {feelings.map((feeling) => {
        const value = data[feeling];
        const intensity = value / maxValue;
        const bgColor = intensity > 0.7 ? '#FF6584' : intensity > 0.4 ? '#FF9500' : '#4BB38A';
        
        return (
          <View key={feeling} className="items-center mb-3" style={{ width: '30%' }}>
            <View 
              className="w-16 h-16 rounded-xl items-center justify-center mb-2"
              style={{ backgroundColor: bgColor + '40', borderWidth: 2, borderColor: bgColor }}
            >
              <Text className="text-white text-xs font-bold">{value.toFixed(0)}%</Text>
            </View>
            <Text className="text-[#7a8b99] text-xs text-center capitalize">{feeling}</Text>
          </View>
        );
      })}
    </View>
  );
};

// Line Chart Component for Commitment Score Trend
const CommitmentTrendChart = ({ data }) => {
  const months = Object.keys(data);
  const values = Object.values(data);
  const maxValue = Math.max(...values);
  const minValue = Math.min(...values);
  
  return (
    <View>
      <View className="flex-row items-end justify-between h-24 mb-2">
        {values.map((value, index) => {
          const height = ((value - minValue) / (maxValue - minValue)) * 80 + 10;
          return (
            <View key={index} className="flex-1 items-center mx-1">
              <View 
                className="bg-[#6C63FF] rounded-t-md w-full"
                style={{ height }}
              />
              <Text className="text-[#7a8b99] text-xs mt-1">{value.toFixed(0)}%</Text>
            </View>
          );
        })}
      </View>
      <View className="flex-row justify-between">
        {months.map((month, index) => (
          <Text key={index} className="text-[#7a8b99] text-xs flex-1 text-center">
            {month.split('-')[1]}
          </Text>
        ))}
      </View>
    </View>
  );
};

// Bar Chart for Relapse % by Time of Day
const TimeOfDayChart = ({ peakRelapseHours }) => {
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const relapseData = hours.map(hour => {
    if (peakRelapseHours.includes(hour)) {
      return Math.random() * 15 + 20; // High relapse rate
    }
    return Math.random() * 10 + 2; // Low relapse rate
  });
  
  const maxValue = Math.max(...relapseData);
  
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View className="flex-row items-end h-20 px-2">
        {hours.map((hour, index) => {
          const height = (relapseData[index] / maxValue) * 60;
          const isPeakHour = peakRelapseHours.includes(hour);
          
          return (
            <View key={hour} className="items-center mx-1">
              <View 
                className="w-3 rounded-t-sm"
                style={{ 
                  height: Math.max(4, height),
                  backgroundColor: isPeakHour ? '#FF6584' : '#6C63FF'
                }}
              />
              <Text className="text-[#7a8b99] text-[10px] mt-1">
                {hour.toString().padStart(2, '0')}
              </Text>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
};

// Calendar Component
const CalendarView = ({ calendarData, daysInMonth, firstDay, currentMonth, currentYear }) => {
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  const today = new Date().getDate();
  const isCurrentMonth = new Date().getMonth() === currentMonth && new Date().getFullYear() === currentYear;
  
  // Create calendar grid
  const calendarGrid = [];
  let dayCount = 1;
  
  for (let week = 0; week < 6; week++) {
    const weekRow = [];
    for (let day = 0; day < 7; day++) {
      const dayIndex = week * 7 + day;
      
      if (dayIndex < firstDay || dayCount > daysInMonth) {
        weekRow.push(null); // Empty cell
      } else {
        const dayData = calendarData[dayCount] || null;
        const isToday = isCurrentMonth && dayCount === today;
        
        weekRow.push({
          day: dayCount,
          data: dayData,
          isToday
        });
        dayCount++;
      }
    }
    calendarGrid.push(weekRow);
    if (dayCount > daysInMonth) break;
  }
  
  const getCellColor = (data) => {
    if (!data) return '#2d2d3a';
    const successRate = data.resisted / data.urges;
    if (successRate >= 0.8) return '#4BB38A';
    if (successRate >= 0.5) return '#FF9500';
    return '#FF6584';
  };
  
  return (
    <View>
      <Text className="text-white text-xl font-bold mb-4 text-center">
        {monthNames[currentMonth]} {currentYear}
      </Text>
      
      {/* Day headers */}
      <View className="flex-row mb-2">
        {dayNames.map((dayName) => (
          <View key={dayName} className="flex-1 items-center">
            <Text className="text-[#7a8b99] text-xs font-semibold">{dayName}</Text>
          </View>
        ))}
      </View>
      
      {/* Calendar grid */}
      {calendarGrid.map((week, weekIndex) => (
        <View key={weekIndex} className="flex-row mb-1">
          {week.map((cell, cellIndex) => (
            <View key={cellIndex} className="flex-1 items-center p-1">
              {cell ? (
                <TouchableOpacity
                  className="w-8 h-8 rounded-lg items-center justify-center border"
                  style={{
                    backgroundColor: getCellColor(cell.data),
                    borderColor: cell.isToday ? '#6C63FF' : 'transparent',
                    borderWidth: cell.isToday ? 2 : 0
                  }}
                >
                  <Text className="text-white text-xs font-bold">{cell.day}</Text>
                </TouchableOpacity>
              ) : (
                <View className="w-8 h-8" />
              )}
            </View>
          ))}
        </View>
      ))}
      
      {/* Legend */}
      <View className="flex-row justify-center mt-4 space-x-4">
        <View className="flex-row items-center">
          <View className="w-3 h-3 rounded bg-[#4BB38A] mr-1" />
          <Text className="text-[#7a8b99] text-xs">Good Day</Text>
        </View>
        <View className="flex-row items-center">
          <View className="w-3 h-3 rounded bg-[#FF9500] mr-1" />
          <Text className="text-[#7a8b99] text-xs">Mixed Day</Text>
        </View>
        <View className="flex-row items-center">
          <View className="w-3 h-3 rounded bg-[#FF6584] mr-1" />
          <Text className="text-[#7a8b99] text-xs">Tough Day</Text>
        </View>
        <View className="flex-row items-center">
          <View className="w-3 h-3 rounded bg-[#2d2d3a] mr-1" />
          <Text className="text-[#7a8b99] text-xs">No Data</Text>
        </View>
      </View>
    </View>
  );
};

// Weekly Activity Chart Component
const WeeklyActivityChart = ({ weeklyData }) => {
  const maxUrges = Math.max(...weeklyData.map(d => d.urges));
  const maxMood = 5;
  
  return (
    <View>
      <View className="flex-row justify-between items-end h-32 mb-4">
        {weeklyData.map((dayData, index) => {
          const urgeHeight = (dayData.urges / maxUrges) * 80;
          const moodHeight = (dayData.mood / maxMood) * 80;
          const resistedWidth = dayData.urges > 0 ? (dayData.resisted / dayData.urges) * 100 : 0;
          
          return (
            <View key={index} className="items-center flex-1">
              {/* Mood indicator (background bar) */}
              <View className="absolute bottom-8 w-6 bg-[#6C63FF] opacity-30 rounded-t-md"
                style={{ height: Math.max(4, moodHeight) }} />
              
              {/* Urge bar with resistance overlay */}
              <View className="relative w-6 rounded-t-md overflow-hidden bg-[#FF6584]"
                style={{ height: Math.max(8, urgeHeight) }}>
                <View 
                  className="absolute bottom-0 w-full bg-[#4BB38A] rounded-t-md"
                  style={{ height: `${resistedWidth}%` }}
                />
              </View>
              
              <Text className="text-[#7a8b99] text-xs mt-2 font-semibold">{dayData.day}</Text>
              
              {/* Stats below day name */}
              <View className="items-center mt-1">
                <Text className="text-[#4BB38A] text-[10px]">{dayData.resisted}R</Text>
                <Text className="text-[#FF6584] text-[10px]">{dayData.relapsed}F</Text>
              </View>
            </View>
          );
        })}
      </View>
      
      {/* Legend */}
      <View className="flex-row justify-center space-x-6">
        <View className="flex-row items-center">
          <View className="w-3 h-3 rounded bg-[#4BB38A] mr-1" />
          <Text className="text-[#7a8b99] text-xs">Resisted</Text>
        </View>
        <View className="flex-row items-center">
          <View className="w-3 h-3 rounded bg-[#FF6584] mr-1" />
          <Text className="text-[#7a8b99] text-xs">Relapsed</Text>
        </View>
        <View className="flex-row items-center">
          <View className="w-3 h-3 rounded bg-[#6C63FF] opacity-30 mr-1" />
          <Text className="text-[#7a8b99] text-xs">Mood Level</Text>
        </View>
      </View>
    </View>
  );
};

export default function AnalyticsScreen() {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [analysisData] = useState(mockAnalysisData);
  const [calendarInfo] = useState(generateCalendarData());
  const [weeklyActivityData] = useState(generateWeeklyActivityData());

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

  // Extract vulnerable time range
  const getVulnerableTimeRange = (peakHours) => {
    const sortedHours = [...peakHours].sort((a, b) => a - b);
    const start = sortedHours[0];
    const end = sortedHours[sortedHours.length - 1];
    
    const formatHour = (hour) => {
      if (hour === 0) return "12am";
      if (hour < 12) return `${hour}am`;
      if (hour === 12) return "12pm";
      return `${hour - 12}pm`;
    };
    
    return `${formatHour(start)}–${formatHour(end + 1)}`;
  };

  return (
    <SafeAreaView className="flex-1 bg-[#0f0f1e]">
      <StatusBar style="light" />
      <View className="flex-1 bg-[#0f0f1e] px-4 pt-4">
        <View className="flex-row items-center mb-6">
          <Text className="text-white text-2xl font-bold">Recovery Analytics</Text>
          <MaterialCommunityIcons name="chart-line" size={24} color="#6C63FF" className="ml-2" />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
          
          {/* Dashboard Overview */}
          <LinearGradient colors={["#1a1a2e", "#0f0f1e"]} className="rounded-3xl p-5 mb-6" start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
            <Text className="text-white text-xl font-bold mb-4">Recovery Overview</Text>
            
            <View className="flex-row justify-between mb-4">
              <View className="items-center flex-1">
                <Text className="text-[#4BB38A] text-2xl font-bold">{analysisData.event_level.urge_outcome_rate.resisted_pct.toFixed(1)}%</Text>
                <Text className="text-[#7a8b99] text-xs">Resisted</Text>
              </View>
              <View className="items-center flex-1">
                <Text className="text-[#FF6584] text-2xl font-bold">{analysisData.event_level.urge_outcome_rate.relapsed_pct.toFixed(1)}%</Text>
                <Text className="text-[#7a8b99] text-xs">Relapsed</Text>
              </View>
              <View className="items-center flex-1">
                <Text className="text-[#6C63FF] text-2xl font-bold">{analysisData.commitment.commitment_score_rolling_30d_avg.toFixed(0)}</Text>
                <Text className="text-[#7a8b99] text-xs">Score</Text>
              </View>
            </View>
          </LinearGradient>

          {/* Pie Chart - Resisted vs Relapsed */}
          <LinearGradient colors={["#1a1a2e", "#0f0f1e"]} className="rounded-3xl p-5 mb-6" start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
            <Text className="text-white text-xl font-bold mb-4">Outcome Distribution</Text>
            <PieChart 
              resisted={analysisData.event_level.urge_outcome_rate.resisted_pct}
              relapsed={analysisData.event_level.urge_outcome_rate.relapsed_pct}
            />
          </LinearGradient>

          {/* Heatmap - Feelings vs Outcome */}
          <LinearGradient colors={["#1a1a2e", "#0f0f1e"]} className="rounded-3xl p-5 mb-6" start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
            <Text className="text-white text-xl font-bold mb-4">Feelings Impact Map</Text>
            <Text className="text-[#7a8b99] text-sm mb-4">Relapse probability by emotional state</Text>
            <FeelingsHeatmap data={analysisData.event_level.feeling_to_outcome_correlation} />
          </LinearGradient>

          {/* Line Chart - Commitment Score Trend */}
          <LinearGradient colors={["#1a1a2e", "#0f0f1e"]} className="rounded-3xl p-5 mb-6" start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
            <Text className="text-white text-xl font-bold mb-4">Commitment Trend</Text>
            <Text className="text-[#7a8b99] text-sm mb-4">Monthly resistance rate progression</Text>
            <CommitmentTrendChart data={analysisData.time_based.recovery_progress_over_time_pct} />
          </LinearGradient>

          {/* Bar Chart - Relapse % by Time-of-Day */}
          <LinearGradient colors={["#1a1a2e", "#0f0f1e"]} className="rounded-3xl p-5 mb-6" start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
            <Text className="text-white text-xl font-bold mb-4">Time Risk Pattern</Text>
            <Text className="text-[#7a8b99] text-sm mb-4">Relapse risk throughout the day</Text>
            <TimeOfDayChart peakRelapseHours={analysisData.time_based.peak_relapse_hours} />
            
            <View className="flex-row items-center justify-center mt-3">
              <View className="flex-row items-center mr-4">
                <View className="w-3 h-3 rounded-full bg-[#FF6584] mr-2" />
                <Text className="text-[#7a8b99] text-xs">High Risk</Text>
              </View>
              <View className="flex-row items-center">
                <View className="w-3 h-3 rounded-full bg-[#6C63FF] mr-2" />
                <Text className="text-[#7a8b99] text-xs">Normal Risk</Text>
              </View>
            </View>
          </LinearGradient>

          {/* Personalized Feedback Cards */}
          <LinearGradient colors={["#1a1a2e", "#0f0f1e"]} className="rounded-3xl p-5 mb-6" start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
            <Text className="text-white text-xl font-bold mb-4">Personal Insights</Text>
            
            {/* Most Vulnerable Time Card */}
            <View className="bg-[#FF6584] bg-opacity-20 rounded-2xl p-4 mb-4 border border-[#FF6584] border-opacity-30">
              <View className="flex-row items-center mb-2">
                <MaterialCommunityIcons name="clock-alert" size={20} color="#FF6584" />
                <Text className="text-[#FF6584] font-semibold ml-2">Most Vulnerable Time</Text>
              </View>
              <Text className="text-white text-base">
                Late night ({getVulnerableTimeRange(analysisData.time_based.peak_relapse_hours)})
              </Text>
              <Text className="text-[#7a8b99] text-sm mt-1">
                {((analysisData.time_based.peak_relapse_hours.length / 24) * 100).toFixed(0)}% of your relapses occur during these hours
              </Text>
            </View>

            {/* Protective Feeling Card */}
            <View className="bg-[#4BB38A] bg-opacity-20 rounded-2xl p-4 mb-4 border border-[#4BB38A] border-opacity-30">
              <View className="flex-row items-center mb-2">
                <MaterialCommunityIcons name="shield-check" size={20} color="#4BB38A" />
                <Text className="text-[#4BB38A] font-semibold ml-2">Protective Feeling</Text>
              </View>
              <Text className="text-white text-base capitalize">
                {analysisData.feeling_dynamics.most_protective_feeling} (oddly enough, you resist best here)
              </Text>
              <Text className="text-[#7a8b99] text-sm mt-1">
                Only {analysisData.event_level.feeling_to_outcome_correlation[analysisData.feeling_dynamics.most_protective_feeling]?.toFixed(1) || 'N/A'}% relapse rate when feeling this way
              </Text>
            </View>

            {/* AI-Generated Risk Profile */}
            <View className="bg-[#6C63FF] bg-opacity-20 rounded-2xl p-4 border border-[#6C63FF] border-opacity-30">
              <View className="flex-row items-center mb-2">
                <MaterialCommunityIcons name="robot" size={20} color="#6C63FF" />
                <Text className="text-[#6C63FF] font-semibold ml-2">AI Risk Profile</Text>
              </View>
              <Text className="text-white text-base">
                {analysisData.user_feedback_loops.personalized_risk_profile}
              </Text>
              <TouchableOpacity className="mt-3">
                <Text className="text-[#6C63FF] text-sm underline">
                  → View detailed recommendations
                </Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>

          {/* Recovery Progress Stats */}
          <LinearGradient colors={["#1a1a2e", "#0f0f1e"]} className="rounded-3xl p-5 mb-6" start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
            <Text className="text-white text-xl font-bold mb-4">Recovery Statistics</Text>
            
            <View className="flex-row justify-between mb-4">
              <View className="items-center flex-1">
                <Text className="text-[#7a8b99] text-sm mb-1">Current Streak</Text>
                <Text className="text-white text-2xl font-bold">{currentStreak}</Text>
                <Text className="text-[#7a8b99] text-xs">days</Text>
              </View>
              <View className="items-center flex-1">
                <Text className="text-[#7a8b99] text-sm mb-1">Best Streak</Text>
                <Text className="text-white text-2xl font-bold">{bestStreak}</Text>
                <Text className="text-[#7a8b99] text-xs">days</Text>
              </View>
              <View className="items-center flex-1">
                <Text className="text-[#7a8b99] text-sm mb-1">Avg Time Between</Text>
                <Text className="text-white text-2xl font-bold">
                  {analysisData.commitment.avg_time_to_relapse_hours ? 
                    Math.round(analysisData.commitment.avg_time_to_relapse_hours) : 'N/A'}
                </Text>
                <Text className="text-[#7a8b99] text-xs">hours</Text>
              </View>
            </View>

            {/* Progress Indicator */}
            <View className="bg-[#2d2d3a] rounded-xl p-3">
              <Text className="text-[#7a8b99] text-sm mb-2">Recovery Progress</Text>
              <View className="w-full h-3 bg-[#1a1a2e] rounded-full">
                <LinearGradient
                  colors={["#6C63FF", "#4BB38A"]}
                  className="h-3 rounded-full"
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={{ width: `${analysisData.commitment.commitment_score_rolling_30d_avg}%` }}
                />
              </View>
              <Text className="text-white text-right text-sm mt-1">
                {analysisData.commitment.commitment_score_rolling_30d_avg.toFixed(0)}% commitment score
              </Text>
            </View>
          </LinearGradient>

          {/* Weekly Activity Chart */}
          <LinearGradient colors={["#1a1a2e", "#0f0f1e"]} className="rounded-3xl p-5 mb-6" start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
            <Text className="text-white text-xl font-bold mb-4">Weekly Activity</Text>
            <Text className="text-[#7a8b99] text-sm mb-4">Your resistance patterns this week</Text>
            <WeeklyActivityChart weeklyData={weeklyActivityData} />
          </LinearGradient>

          {/* Calendar View */}
          <LinearGradient colors={["#1a1a2e", "#0f0f1e"]} className="rounded-3xl p-5 mb-6" start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
            <Text className="text-white text-xl font-bold mb-4">Recovery Calendar</Text>
            <Text className="text-[#7a8b99] text-sm mb-4">Track your daily progress and patterns</Text>
            <CalendarView 
              calendarData={calendarInfo.calendarData}
              daysInMonth={calendarInfo.daysInMonth}
              firstDay={calendarInfo.firstDay}
              currentMonth={calendarInfo.currentMonth}
              currentYear={calendarInfo.currentYear}
            />
          </LinearGradient>

        </ScrollView>
      </View>
    </SafeAreaView>
  );
}


