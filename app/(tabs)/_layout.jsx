import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Tabs } from 'expo-router';
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
    </>
  );
};

export default Layout;