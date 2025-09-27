import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Tabs, router } from 'expo-router';
import { useState } from 'react';
import {
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

const Layout = () => {
  // Global Chatbot state
  const [showChatbot, setShowChatbot] = useState(false);
  
  // Global Urge Help state
  const [showUrgeHelpModal, setShowUrgeHelpModal] = useState(false);
  
  const dopamineSwapSuggestions = {
    immediate: [
      { id: 'breathing', name: 'Deep Breathing', icon: 'lungs', duration: '2 min', color: '#4BB38A' },
      { id: 'coldwater', name: 'Cold Water Face', icon: 'water', duration: '30 sec', color: '#6C63FF' },
      { id: 'pushups', name: '10 Push-ups', icon: 'dumbbell', duration: '1 min', color: '#FF9500' },
      { id: 'music', name: 'Favorite Song', icon: 'music', duration: '3 min', color: '#FF6584' },
    ],
    longer: [
      { id: 'walk', name: 'Quick Walk', icon: 'walk', duration: '10 min', color: '#4BB38A' },
      { id: 'call', name: 'Call a Friend', icon: 'phone', duration: '15 min', color: '#6C63FF' },
      { id: 'hobby', name: 'Creative Hobby', icon: 'palette', duration: '30 min', color: '#FF9500' },
      { id: 'exercise', name: 'Workout', icon: 'dumbbell', duration: '20 min', color: '#FF6584' },
    ]
  };
  const [chatMessages, setChatMessages] = useState([
    {
      id: 1,
      text: "Hi! I'm your recovery assistant. I'm here to help you stay motivated and provide support whenever you need it. How are you feeling today?",
      isBot: true,
      timestamp: new Date()
    }
  ]);
  const [chatInput, setChatInput] = useState("");

  // Chatbot functions
  const handleSendMessage = () => {
    if (!chatInput.trim()) return;
    
    const userMessage = {
      id: Date.now(),
      text: chatInput.trim(),
      isBot: false,
      timestamp: new Date()
    };
    
    setChatMessages(prev => [...prev, userMessage]);
    setChatInput("");
    
    // Simulate bot response after a short delay
    setTimeout(() => {
      const botResponse = getBotResponse(userMessage.text);
      const botMessage = {
        id: Date.now() + 1,
        text: botResponse,
        isBot: true,
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, botMessage]);
    }, 1000);
  };
  
  const getBotResponse = (userInput) => {
    const input = userInput.toLowerCase();
    
    if (input.includes('streak') || input.includes('progress')) {
      return "Great job on your progress! Remember, every day clean is a victory. What's helping you stay strong?";
    } else if (input.includes('urge') || input.includes('tempt') || input.includes('trigger')) {
      return "I understand you're facing a challenge. Try the 4-7-8 breathing technique: inhale for 4, hold for 7, exhale for 8. You can also check out the Emergency tab for immediate coping strategies. You've got this!";
    } else if (input.includes('sad') || input.includes('down') || input.includes('depressed')) {
      return "I'm sorry you're feeling down. Remember that healing isn't linear, and it's okay to have difficult days. Consider doing a quick workout or reaching out to your support network. Your feelings are valid and temporary.";
    } else if (input.includes('motivation') || input.includes('inspire')) {
      return "You've already shown incredible strength! Every moment you choose recovery, you're building a better future. What's one thing you're grateful for today?";
    } else if (input.includes('help') || input.includes('support')) {
      return "I'm here to support you! You can ask me about coping strategies, motivation, or just talk about how you're feeling. You can also explore the Community tab to connect with others on similar journeys.";
    } else {
      const responses = [
        "That's really important to share. How can I support you with that?",
        "Thank you for opening up. Your recovery journey matters, and I'm here to help.",
        "I appreciate you sharing that with me. What would be most helpful for you right now?",
        "Your honesty is a sign of strength. What's one small step you could take today?"
      ];
      return responses[Math.floor(Math.random() * responses.length)];
    }
  };

  return (
    <>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: '#0f0f1e',
            borderTopColor: '#1a1a2e',
            borderTopWidth: 1,
            height: 70,
            paddingBottom: 10,
            paddingTop: 10,
          },
          tabBarActiveTintColor: '#6C63FF',
          tabBarInactiveTintColor: '#7a8b99',
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '600',
          },
        }}
      >
        <Tabs.Screen
          name="HomeScreen"
          options={{
            title: 'Home',
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="home" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="AnalyticsScreen"
          options={{
            title: 'Analytics',
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="chart-line" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="EmergencyScreen"
          options={{
            title: 'Emergency',
            tabBarIcon: ({ color, size, focused }) => (
              <MaterialCommunityIcons 
                name="alert-circle" 
                size={size} 
                color={focused ? '#FF9500' : '#FF9500'} // Always orange to stand out
              />
            ),
            tabBarLabelStyle: {
              fontSize: 12,
              fontWeight: '700', // Slightly bolder
              color: '#FF9500', // Orange text color
            },
          }}
        />
        <Tabs.Screen
          name="CommunityScreen"
          options={{
            title: 'Community',
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="account-group" size={size} color={color} />
            ),
          }}
        />
      </Tabs>

      {/* Global Floating Urge Help Button - Part of navbar layout */}
      <TouchableOpacity
        style={{
          position: 'absolute',
          bottom: 85, // Just above the navbar
          left: 20,
          width: 56,
          height: 56,
          borderRadius: 28,
          shadowColor: "#FF6584",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 8,
          zIndex: 1000,
        }}
        onPress={() => setShowUrgeHelpModal(true)}
      >
        <LinearGradient
          colors={["#FF6584", "#FF9500"]}
          style={{
            width: 56,
            height: 56,
            borderRadius: 28,
            alignItems: 'center',
            justifyContent: 'center',
          }}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <MaterialCommunityIcons name="alert-circle" size={24} color="white" />
        </LinearGradient>
        {/* Notification pulse */}
        <View
          style={{
            position: 'absolute',
            top: -2,
            right: -2,
            width: 16,
            height: 16,
            backgroundColor: '#FF6584',
            borderRadius: 8,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text style={{ color: 'white', fontSize: 10, fontWeight: 'bold' }}>!</Text>
        </View>
      </TouchableOpacity>

      {/* Global Floating Chatbot Button - Part of navbar layout */}
      <TouchableOpacity
        style={{
          position: 'absolute',
          bottom: 85, // Just above the navbar
          right: 20,
          width: 56,
          height: 56,
          borderRadius: 28,
          shadowColor: "#6C63FF",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 8,
          zIndex: 1000,
        }}
        onPress={() => setShowChatbot(true)}
      >
        <LinearGradient
          colors={["#6C63FF", "#4BB38A"]}
          style={{
            width: 56,
            height: 56,
            borderRadius: 28,
            alignItems: 'center',
            justifyContent: 'center',
          }}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <MaterialCommunityIcons name="robot" size={24} color="white" />
        </LinearGradient>
        {/* Notification dot */}
        <View
          style={{
            position: 'absolute',
            top: -2,
            right: -2,
            width: 16,
            height: 16,
            backgroundColor: '#FF6584',
            borderRadius: 8,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <View
            style={{
              width: 8,
              height: 8,
              backgroundColor: 'white',
              borderRadius: 4,
            }}
          />
        </View>
      </TouchableOpacity>

      {/* Global Chatbot Modal */}
      <Modal
        visible={showChatbot}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowChatbot(false)}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
          <KeyboardAvoidingView 
            style={{ flex: 1, justifyContent: 'flex-end' }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          >
            <View 
              style={{ 
                backgroundColor: '#0f0f1e', 
                borderTopLeftRadius: 24, 
                borderTopRightRadius: 24,
                height: '80%' 
              }}
            >
              {/* Chat Header */}
              <View 
                style={{ 
                  flexDirection: 'row', 
                  alignItems: 'center', 
                  justifyContent: 'space-between', 
                  padding: 16, 
                  borderBottomWidth: 1, 
                  borderBottomColor: '#1a1a2e' 
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <LinearGradient
                    colors={["#6C63FF", "#4BB38A"]}
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 20,
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: 12,
                    }}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <MaterialCommunityIcons name="robot" size={20} color="white" />
                  </LinearGradient>
                  <View>
                    <Text style={{ color: 'white', fontWeight: '600', fontSize: 16 }}>Recovery Assistant</Text>
                    <Text style={{ color: '#7a8b99', fontSize: 12 }}>Always here to help</Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={{ padding: 8 }}
                  onPress={() => setShowChatbot(false)}
                >
                  <MaterialCommunityIcons name="close" size={24} color="#7a8b99" />
                </TouchableOpacity>
              </View>
              
              {/* Chat Messages */}
              <ScrollView 
                style={{ flex: 1, paddingHorizontal: 16, paddingVertical: 16 }}
                showsVerticalScrollIndicator={false}
              >
                {chatMessages.map((message) => (
                  <View
                    key={message.id}
                    style={{
                      marginBottom: 16,
                      alignItems: message.isBot ? 'flex-start' : 'flex-end',
                    }}
                  >
                    <View
                      style={{
                        maxWidth: '80%',
                        padding: 12,
                        borderRadius: 16,
                        backgroundColor: message.isBot ? '#1a1a2e' : '#6C63FF',
                        borderBottomLeftRadius: message.isBot ? 4 : 16,
                        borderBottomRightRadius: message.isBot ? 16 : 4,
                      }}
                    >
                      <Text style={{ color: 'white', fontSize: 14 }}>{message.text}</Text>
                      <Text style={{ color: '#7a8b99', fontSize: 10, marginTop: 4 }}>
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </Text>
                    </View>
                  </View>
                ))}
              </ScrollView>
              
              {/* Chat Input */}
              <View 
                style={{ 
                  flexDirection: 'row', 
                  alignItems: 'center', 
                  padding: 16, 
                  borderTopWidth: 1, 
                  borderTopColor: '#1a1a2e' 
                }}
              >
                <View 
                  style={{ 
                    flex: 1, 
                    backgroundColor: '#1a1a2e', 
                    borderRadius: 16, 
                    paddingHorizontal: 16, 
                    paddingVertical: 12, 
                    marginRight: 12 
                  }}
                >
                  <TextInput
                    value={chatInput}
                    onChangeText={setChatInput}
                    placeholder="Type your message..."
                    placeholderTextColor="#7a8b99"
                    style={{ color: 'white' }}
                    multiline
                    maxLength={500}
                    onSubmitEditing={handleSendMessage}
                    blurOnSubmit={false}
                  />
                </View>
                <TouchableOpacity
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 24,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  onPress={handleSendMessage}
                  disabled={!chatInput.trim()}
                >
                  <LinearGradient
                    colors={chatInput.trim() ? ["#6C63FF", "#4BB38A"] : ["#2d2d3a", "#2d2d3a"]}
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 24,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <MaterialCommunityIcons 
                      name="send" 
                      size={20} 
                      color={chatInput.trim() ? "white" : "#7a8b99"} 
                    />
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
      
      {/* Global Urge Help Modal */}
      <Modal
        visible={showUrgeHelpModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowUrgeHelpModal(false)}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
          <View style={{ backgroundColor: '#1a1a2e', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: '80%' }}>
            {/* Header */}
            <View style={{ alignItems: 'center', marginBottom: 24 }}>
              <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(255, 101, 132, 0.2)', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                <MaterialCommunityIcons name="alert-circle" size={28} color="#FF6584" />
              </View>
              <Text style={{ color: 'white', fontSize: 20, fontWeight: 'bold' }}>I'm Feeling an Urge</Text>
              <Text style={{ color: '#7a8b99', fontSize: 14, textAlign: 'center', marginTop: 4 }}>
                Choose your support level
              </Text>
            </View>
            
            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Emergency Mode Option */}
              <TouchableOpacity 
                style={{ backgroundColor: 'rgba(255, 101, 132, 0.2)', borderColor: 'rgba(255, 101, 132, 0.4)', borderWidth: 1, borderRadius: 16, padding: 16, marginBottom: 16 }}
                onPress={() => {
                  setShowUrgeHelpModal(false);
                  router.push("/(tabs)/EmergencyScreen");
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: '#FF6584', alignItems: 'center', justifyContent: 'center', marginRight: 16 }}>
                    <MaterialCommunityIcons name="phone-alert" size={24} color="white" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: 'white', fontSize: 18, fontWeight: 'bold' }}>Emergency Mode</Text>
                    <Text style={{ color: '#7a8b99', fontSize: 14 }}>Get immediate professional support</Text>
                  </View>
                  <MaterialCommunityIcons name="chevron-right" size={24} color="#FF6584" />
                </View>
              </TouchableOpacity>
              
              {/* Dopamine Swaps Section */}
              <View style={{ backgroundColor: '#2d2d3a', borderRadius: 16, padding: 16, marginBottom: 16 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                  <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#4BB38A', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                    <MaterialCommunityIcons name="swap-horizontal" size={20} color="white" />
                  </View>
                  <Text style={{ color: 'white', fontSize: 18, fontWeight: 'bold', flex: 1 }}>Quick Dopamine Swaps</Text>
                  <TouchableOpacity onPress={() => {
                    setShowUrgeHelpModal(false);
                    router.push("/DopamineSwapsScreen");
                  }}>
                    <Text style={{ color: '#4BB38A', fontWeight: '600' }}>View All</Text>
                  </TouchableOpacity>
                </View>
                
                {/* Immediate Actions */}
                <Text style={{ color: 'white', fontWeight: '600', marginBottom: 12, fontSize: 14 }}>Immediate (0-5 min)</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 16 }}>
                  {dopamineSwapSuggestions.immediate.map((activity) => (
                    <TouchableOpacity 
                      key={activity.id}
                      style={{ width: '48%', padding: 12, borderRadius: 12, marginBottom: 8, backgroundColor: activity.color + '20' }}
                    >
                      <View style={{ alignItems: 'center' }}>
                        <MaterialCommunityIcons name={activity.icon} size={24} color={activity.color} />
                        <Text style={{ color: 'white', fontSize: 12, fontWeight: '600', marginTop: 4, textAlign: 'center' }}>{activity.name}</Text>
                        <Text style={{ color: '#7a8b99', fontSize: 12, marginTop: 2 }}>{activity.duration}</Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
                
                {/* Longer Activities */}
                <Text style={{ color: 'white', fontWeight: '600', marginBottom: 12, fontSize: 14 }}>Longer Activities (10+ min)</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
                  {dopamineSwapSuggestions.longer.map((activity) => (
                    <TouchableOpacity 
                      key={activity.id}
                      style={{ width: '48%', padding: 12, borderRadius: 12, marginBottom: 8, backgroundColor: activity.color + '20' }}
                    >
                      <View style={{ alignItems: 'center' }}>
                        <MaterialCommunityIcons name={activity.icon} size={24} color={activity.color} />
                        <Text style={{ color: 'white', fontSize: 12, fontWeight: '600', marginTop: 4, textAlign: 'center' }}>{activity.name}</Text>
                        <Text style={{ color: '#7a8b99', fontSize: 12, marginTop: 2 }}>{activity.duration}</Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </ScrollView>
            
            {/* Close Button */}
            <TouchableOpacity 
              style={{ marginTop: 16, padding: 16, backgroundColor: '#2d2d3a', borderRadius: 16 }}
              onPress={() => setShowUrgeHelpModal(false)}
            >
              <Text style={{ color: 'white', textAlign: 'center', fontWeight: '600' }}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
};

export default Layout;