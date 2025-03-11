import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity,StyleSheet } from "react-native";
import { Card, Button } from "react-native-paper";
import { Platform } from 'react-native';
import Typography from './typography';


const LoginScreen = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleLogin = () => {
    console.log("Logging in with:", username, password);
  };

  const handleSignUp = () => {
    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    console.log("Creating account with:", username, password);
  };

  const createLoginText = () => {

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
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 20 }}>
      <Card style={{ width: "100%", maxWidth: 400, padding: 20 }}>
        <Card.Content>
          
          <View style={{marginBottom: 20}}>
          <Text style={[Typography.heroHeading, Typography.centered,]}>
            {isSignUp ? ("Create an Account") : "Login"}
          </Text>
          </View>

          <TextInput
            style={styles.input}
            placeholder="Username"
            value={username}
            onChangeText={setUsername}
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
          
          {isSignUp && (
            <TextInput
              style={styles.input}
              placeholder="Confirm Password"
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />
          )}

          <Button mode="contained" onPress={isSignUp ? handleSignUp : handleLogin} style={[Typography.coolBlue, {marginTop: 10, }]}>
            {isSignUp ? "Sign Up" : "Login"}
          </Button>

          <TouchableOpacity onPress={() => setIsSignUp(!isSignUp)}>
            <Text style ={[Typography.bodySize12,{ textAlign: "center", marginTop: 15,}]}>
              {createLoginText()}
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


export default LoginScreen;
