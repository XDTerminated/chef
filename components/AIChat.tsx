import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

interface AIChatProps {
  onClose?: () => void;
  isFullScreen?: boolean;
  showBackButton?: boolean;
}

export default function AIChat({ onClose, isFullScreen = false, showBackButton = false }: AIChatProps) {
  console.log('AIChat props:', { onClose: !!onClose, isFullScreen, showBackButton });
  
  // Always show back button when in full screen mode
  const shouldShowBackButton = showBackButton || isFullScreen;
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hi! I'm your AI cooking assistant. I can help you find recipes, suggest cooking techniques, answer cooking questions, and much more! What would you like to know?",
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isMentraConnected, setIsMentraConnected] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const simulateAIResponse = (userMessage: string): string => {
    const responses = [
      "That's a great cooking question! Let me help you with that.",
      "I'd be happy to suggest some recipes for you!",
      "Here's a cooking tip that might help:",
      "That's a common cooking challenge. Here's what I recommend:",
      "I can definitely help you with that cooking technique!",
    ];
    
    return responses[Math.floor(Math.random() * responses.length)] + 
           ` You asked about "${userMessage.toLowerCase()}". This is a placeholder response - in the real app, this would connect to an AI service like OpenAI or Claude.`;
  };

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: generateId(),
      text: inputText.trim(),
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    // Simulate AI response delay
    setTimeout(() => {
      const aiResponse: Message = {
        id: generateId(),
        text: simulateAIResponse(userMessage.text),
        isUser: false,
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const handleVoiceInput = () => {
    if (isRecording) {
      // Stop recording
      setIsRecording(false);
      Alert.alert(
        'Voice Input',
        'Voice recording stopped. In the real app, this would process the audio with Whisper and convert it to text.',
        [{ text: 'OK' }]
      );
    } else {
      // Start recording
      setIsRecording(true);
      Alert.alert(
        'Voice Input',
        'Voice recording started! In the real app, this would integrate with Whisper for speech-to-text.',
        [
          {
            text: 'Stop Recording',
            onPress: () => setIsRecording(false),
          },
        ]
      );
    }
  };

  const handleMentraConnection = () => {
    if (isMentraConnected) {
      // Disconnect from Mentra glasses
      setIsMentraConnected(false);
      Alert.alert(
        'Mentra Glasses',
        'Disconnected from Mentra glasses. You can no longer use hands-free cooking assistance.',
        [{ text: 'OK' }]
      );
    } else {
      // Connect to Mentra glasses
      setIsMentraConnected(true);
      Alert.alert(
        'Mentra Glasses',
        'Connected to Mentra glasses! You can now use hands-free cooking assistance. The AI will guide you through recipes with visual overlays.',
        [{ text: 'OK' }]
      );
    }
  };

  const renderMessage = (message: Message) => (
    <View
      key={message.id}
      style={[
        styles.messageContainer,
        message.isUser ? styles.userMessage : styles.aiMessage,
      ]}
    >
      <View
        style={[
          styles.messageBubble,
          message.isUser ? styles.userBubble : styles.aiBubble,
        ]}
      >
        <Text
          style={[
            styles.messageText,
            message.isUser ? styles.userText : styles.aiText,
          ]}
        >
          {message.text}
        </Text>
        <Text style={styles.timestamp}>
          {message.timestamp.toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </Text>
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={[styles.container, isFullScreen && styles.fullScreen]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.headerCenter}>
            <View style={styles.aiIcon}>
              <Ionicons name="sparkles" size={20} color="#FF8C00" />
            </View>
            <Text style={styles.headerTitle}>AI Cooking Assistant</Text>
          </View>
          {onClose && !shouldShowBackButton ? (
            <Pressable onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#666" />
            </Pressable>
          ) : null}
        </View>
        
        {/* Back Button - Moved to bottom section */}
        {shouldShowBackButton && (
          <View style={styles.backButtonSection}>
            <Pressable onPress={onClose} style={styles.backButtonNew}>
              <Ionicons name="arrow-back" size={20} color="#333" />
              <Text style={styles.backButtonText}>Back to Main</Text>
            </Pressable>
          </View>
        )}
        
        {/* Mentra Connection */}
        <View style={styles.mentraSection}>
          <Pressable 
            onPress={handleMentraConnection} 
            style={[
              styles.mentraButton,
              isMentraConnected && styles.mentraButtonConnected
            ]}
          >
            <Ionicons 
              name={isMentraConnected ? "glasses" : "glasses-outline"} 
              size={18} 
              color={isMentraConnected ? "#fff" : "#FF8C00"} 
            />
            <Text style={[
              styles.mentraButtonText,
              isMentraConnected && styles.mentraButtonTextConnected
            ]}>
              {isMentraConnected ? 'Connected' : 'Connect Glasses'}
            </Text>
          </Pressable>
        </View>
      </View>

      {/* Messages */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
      >
        {isMentraConnected && (
          <View style={styles.mentraStatusContainer}>
            <View style={styles.mentraStatusBubble}>
              <Ionicons name="glasses" size={16} color="#FF8C00" />
              <Text style={styles.mentraStatusText}>
                Mentra glasses connected - Hands-free cooking assistance available
              </Text>
            </View>
          </View>
        )}
        {messages.map(renderMessage)}
        {isTyping && (
          <View style={[styles.messageContainer, styles.aiMessage]}>
            <View style={[styles.messageBubble, styles.aiBubble]}>
              <View style={styles.typingIndicator}>
                <ActivityIndicator size="small" color="#FF8C00" />
                <Text style={styles.typingText}>AI is thinking...</Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Input Area */}
      <View style={styles.inputContainer}>
        <View style={styles.inputRow}>
          <TextInput
            style={styles.textInput}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Ask me anything about cooking..."
            placeholderTextColor="#999"
            multiline
            maxLength={500}
          />
          <Pressable
            style={[
              styles.voiceButton,
              isRecording && styles.voiceButtonActive,
            ]}
            onPress={handleVoiceInput}
          >
            <Ionicons
              name={isRecording ? "stop" : "mic"}
              size={20}
              color={isRecording ? "#fff" : "#FF8C00"}
            />
          </Pressable>
          <Pressable
            style={[
              styles.sendButton,
              !inputText.trim() && styles.sendButtonDisabled,
            ]}
            onPress={handleSendMessage}
            disabled={!inputText.trim()}
          >
            <Ionicons
              name="send"
              size={20}
              color={inputText.trim() ? "#fff" : "#999"}
            />
          </Pressable>
        </View>
        {isRecording && (
          <View style={styles.recordingIndicator}>
            <View style={styles.recordingDot} />
            <Text style={styles.recordingText}>Recording... Tap to stop</Text>
          </View>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  fullScreen: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  header: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e5e9',
    paddingBottom: 12,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  backButtonSection: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  backButtonNew: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    alignSelf: 'flex-start',
  },
  backButtonText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  mentraSection: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  aiIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#fff5e6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  closeButton: {
    padding: 4,
  },
  mentraButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff5e6',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#FF8C00',
    alignSelf: 'flex-start',
  },
  mentraButtonConnected: {
    backgroundColor: '#FF8C00',
    borderColor: '#FF8C00',
  },
  mentraButtonText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '600',
    color: '#FF8C00',
  },
  mentraButtonTextConnected: {
    color: '#fff',
  },
  mentraStatusContainer: {
    marginBottom: 12,
  },
  mentraStatusBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff5e6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#ffe0b3',
  },
  mentraStatusText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#FF8C00',
    fontWeight: '500',
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
  },
  messageContainer: {
    marginBottom: 12,
  },
  userMessage: {
    alignItems: 'flex-end',
  },
  aiMessage: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
  },
  userBubble: {
    backgroundColor: '#FF8C00',
    borderBottomRightRadius: 4,
  },
  aiBubble: {
    backgroundColor: '#fff',
    borderBottomLeftRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  userText: {
    color: '#fff',
  },
  aiText: {
    color: '#333',
  },
  timestamp: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typingText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  inputContainer: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e1e5e9',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e1e5e9',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    maxHeight: 100,
    marginRight: 8,
  },
  voiceButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff5e6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  voiceButtonActive: {
    backgroundColor: '#FF8C00',
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FF8C00',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#e1e5e9',
  },
  recordingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingHorizontal: 16,
  },
  recordingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ff4444',
    marginRight: 8,
  },
  recordingText: {
    fontSize: 14,
    color: '#ff4444',
    fontWeight: '500',
  },
});