import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity,StyleSheet } from "react-native";
import { Card } from "react-native-paper";
import { Button } from "react-native-paper";
import { Platform } from 'react-native';
import Typography from './typography';
import NewScreen from './budgethome';
import {Link} from 'expo-router';
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { signInWithEmailAndPassword } from 'firebase/auth';
import {connectAuthEmulator } from "firebase/auth";



function LoginScreen(){
  
  const auth = getAuth();
  connectAuthEmulator(auth, "http://127.0.0.1:9099");
  
  
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  
  
  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // Signed in successfully.
      console.log('Logged in!');
    } catch (error) {
      console.error("An error occurred:", error);
    }
  };

  const handleSignUp = async () => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      // User account created and signed in.
      console.log('Account created!');
    } catch (error) {
      console.error("An error occurred:", error);
    }
  };

  const signUpOrLogin = () => {

    if(isSignUp == true){
     return( <Text>Already have an account?
              <Text style={{color: "blue"}}> Login</Text>
                </Text>)
     
      }
      
      else{
        return(<Text>Not a member?
          <Text style={{color: "blue"}}> Register now</Text>
            </Text>)
      }


    }

  return (
    <View style={{ flex: 3, justifyContent: "center", alignItems: "center", padding: 20 ,backgroundColor: '#ffffff' }}>
      <Card style={{ width: "100%", maxWidth: 500, padding: 20 , backgroundColor: '#FFFFFF',}}>
        <Card.Content>
          
          <View style={{marginBottom: 20}}>
          <Text style = {[Typography.heroHeading, Typography.centered, {marginBottom: 115}]}>
            {isSignUp ? ("Create an Account") : "Budget"}
          </Text>
          <Text style = {[Typography.h1]}>Welcome!</Text>
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

          <Text style = {[{color: '#006FFD'}]}>Forgot Password?</Text>
          
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
            <Text style ={[Typography.bodySize12,{ textAlign: "center", marginTop: 15,}]}>
              {signUpOrLogin()}
            </Text>
          </TouchableOpacity>
        </Card.Content>
      </Card>
    </View>
  );
};






const styles = {
  input: {
    width: "100%" as "100%", // Explicitly typing it as valid
    padding: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    marginBottom: 10,
  } as const, // Ensures TypeScript infers it correctly
};


export default function App(){


return LoginScreen();



}


