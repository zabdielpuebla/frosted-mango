import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Platform, ScrollView } from "react-native";
import { Card, Button } from "react-native-paper";
import Typography from './utils/typography';
import { useRouter } from 'expo-router';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, connectAuthEmulator, sendPasswordResetEmail } from "firebase/auth";
import { auth, db } from './lib/firebase';
import { doc, getDoc, setDoc } from "firebase/firestore";



export default function App() {
 // const auth = getAuth();
  //connectAuthEmulator(auth, "http://127.0.0.1:9099");

  const router = useRouter();

  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");



  const handleSignUp = async () => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
  
      // Save user to Firestore
      await setDoc(doc(db, "users", user.uid), {
        email: user.email,
        createdAt: new Date().toISOString(),
        displayName: "", //  add input later
        budget: 0,
        totalSpent: 0,
      });
  
      console.log("✅ Account created and data saved!");
  
      
    } catch (error) {
      console.error("❌ Sign-up error:", error);
    }
  };
  
  const handleLogin = async () => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);
  
      if (!docSnap.exists()) {
        console.warn(" No Firestore data found for user.");
        
        await setDoc(docRef, {
          email: user.email,
          createdAt: new Date().toISOString(),
          displayName: "",
          budget: 0,
          totalSpent: 0,
        });
  
        console.log(" Firestore doc created for existing user.");
      }
  
      router.push(`/tabs/budgethome?uid=${user.uid}`);

    } catch (error) {
      console.error("An error occurred:", error);
    }
  };

  const handlePasswordReset = async () => {
    if (!email) {
      alert("Please enter your email above first.");
      return;
    }
  
    try {
      await sendPasswordResetEmail(auth, email);
      alert("Password reset link sent! Check your email.");
    } catch (error: any) {
      console.error(" Password reset error:", error);
      alert("Something went wrong. Try again.");
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

  const styles = StyleSheet.create({
    scrollContainer: {
      flexGrow: 1,
      justifyContent: 'center',
      backgroundColor: '#fff',
    },
    container: {
      padding: 24,
      alignItems: 'center',
    },
    title: {
      marginBottom: 20,
      textAlign: 'center',
    },
    subHeader: {
      marginBottom: 20,
      textAlign: 'center',
    },
    input: {
      width: '100%',
      padding: 10,
      borderWidth: 1,
      borderColor: '#ccc',
      borderRadius: 8,
      marginBottom: 12,
    },
  });
  

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <Text style={[Typography.heroHeading, Typography.centered, styles.title]}>
          {isSignUp ? "Create an Account" : "Budget App"}
        </Text>
  
        <Text style={[Typography.h1, styles.subHeader]}>Welcome!</Text>
  
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
  
  {!isSignUp && (
  <TouchableOpacity onPress={handlePasswordReset}>
    <Text style={{ color: '#006FFD', marginBottom: 10 }}>
      Forgot Password?
    </Text>
  </TouchableOpacity>
)}

  
        {isSignUp && (
          <TextInput
            style={styles.input}
            placeholder="Confirm Password"
            secureTextEntry
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />
        )}
  
        <Button
          mode="contained"
          onPress={isSignUp ? handleSignUp : handleLogin}
          style={[Typography.coolBlue, { marginTop: 10, borderRadius: 25 }]}
        >
          {isSignUp ? "Sign Up" : "Login"}
        </Button>
  
        <TouchableOpacity onPress={() => setIsSignUp(!isSignUp)}>
          <Text style={{ marginTop: 20, color: '#006FFD', textAlign: 'center' }}>
            {isSignUp ? "Already have an account? Login" : "Not a member? Register now"}
          </Text>
        </TouchableOpacity>
  
       
      </View>
    </ScrollView>
  );
  



}
