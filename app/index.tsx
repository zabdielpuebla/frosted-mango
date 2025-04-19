import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Platform } from "react-native";
import { Card, Button } from "react-native-paper";
import Typography from './typography';
import { useRouter } from 'expo-router';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, connectAuthEmulator } from "firebase/auth";
import PlaidScreen from './PlaidScreen';

export default function App() {
  const auth = getAuth();
  connectAuthEmulator(auth, "http://127.0.0.1:9099");

  const router = useRouter();

  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      console.log('Logged in!');
    } catch (error) {
      console.error("An error occurred:", error);
    }
  };

  const handleSignUp = async () => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      console.log('Account created!');
    } catch (error) {
      console.error("An error occurred:", error);
    }
  };

  const signUpOrLogin = () => {
    return (
      <Text style={Typography.bodySize12}>
        {isSignUp ? "Already have an account?" : "Not a member?"}
        <Text style={{ color: "blue" }}>
          {" "}{isSignUp ? "Login" : "Register now"}
        </Text>
      </Text>
    );
  };
  

  return (
    <View style={{ flex: 1, padding: 20, backgroundColor: '#ffffff' }}>
      <Card style={{ width: "100%", maxWidth: 500, padding: 20, backgroundColor: '#FFFFFF', alignSelf: 'center' }}>
        <Card.Content>
          <View style={{ marginBottom: 20 }}>
            <Text style={[Typography.heroHeading, Typography.centered, { marginBottom: 115 }]}>
              {isSignUp ? "Create an Account" : "Budget"}
            </Text>
            <Text style={[Typography.h1]}>Welcome!</Text>
          </View>

          <TextInput
            style={styles.input}
            placeholder="Username"
            value={email}
            onChangeText={setUsername}
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          <Text style={[{ color: '#006FFD' }]}>Forgot Password?</Text>

          {isSignUp && (
            <TextInput
              style={styles.input}
              placeholder="Confirm Password"
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />
          )}

          <Button mode="contained" onPress={isSignUp ? handleSignUp : handleLogin} style={[Typography.coolBlue, { marginTop: 10 }]}>
            {isSignUp ? "Sign Up" : "Login"}
          </Button>

          <TouchableOpacity onPress={() => setIsSignUp(!isSignUp)}>
          <View style={{ marginTop: 15, alignItems: 'center' }}>
  {signUpOrLogin()}
</View>


          </TouchableOpacity>
        </Card.Content>
      </Card>

      {/* 👇 Show Plaid below login */}
      <View style={{ flex: 1, marginTop: 40 }}>
        <PlaidScreen />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  input: {
    width: "100%",
    padding: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    marginBottom: 10,
  },
});
