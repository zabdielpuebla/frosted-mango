import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TextInput, Button, ActivityIndicator, Alert } from 'react-native';
import { getAuth, updatePassword, updateEmail, EmailAuthProvider, reauthenticateWithCredential, signOut } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useRouter } from 'expo-router';

const AccountScreen = () => {
  const auth = getAuth();
  const currentUser = auth.currentUser;
  const router = useRouter();

  const [displayName, setDisplayName] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [emailField, setEmailField] = useState(currentUser?.email || '');
  const [savingName, setSavingName] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [savingEmail, setSavingEmail] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [showEmailFields, setShowEmailFields] = useState(false);
  const [currentEmailPassword, setCurrentEmailPassword] = useState('');

  useEffect(() => {
    const fetchUserData = async () => {
      if (!currentUser) return;

      try {
        const userRef = doc(db, 'users', currentUser.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const data = userSnap.data();
          setDisplayName(data.displayName || '');
          setEmailField(data.email || currentUser.email || '');
        }

        setLoading(false);
      } catch (err) {
        console.error('Error fetching user data:', err);
        setLoading(false);
      }
    };

    fetchUserData();
  }, [currentUser]);

  const handleSaveName = async () => {
    if (!currentUser) return;
    setSavingName(true);

    try {
      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, { displayName });
      Alert.alert('Success', 'Display name updated successfully');
    } catch (err) {
      console.error('Error updating display name:', err);
      Alert.alert('Error', 'Failed to update display name');
    } finally {
      setSavingName(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentUser || !currentPassword || !newPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    setSavingPassword(true);

    const credential = EmailAuthProvider.credential(currentUser.email || '', currentPassword);

    try {
      await reauthenticateWithCredential(currentUser, credential);
      await updatePassword(currentUser, newPassword);
      Alert.alert('Success', 'Password updated successfully');
      setCurrentPassword('');
      setNewPassword('');
      setShowPasswordFields(false);
    } catch (err: any) {
      console.error('Error updating password:', err);
      Alert.alert('Error', err.message || 'Failed to change password');
    } finally {
      setSavingPassword(false);
    }
  };

  const handleChangeEmail = async () => {
    if (!currentUser || !newEmail || !currentEmailPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setSavingEmail(true);

    const credential = EmailAuthProvider.credential(currentUser.email || '', currentEmailPassword);

    try {
      await reauthenticateWithCredential(currentUser, credential);
      await updateEmail(currentUser, newEmail);

      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, { email: newEmail });

      Alert.alert('Success', 'Email updated successfully');
      setEmailField(newEmail);
      setNewEmail('');
      setCurrentEmailPassword('');
      setShowEmailFields(false);
    } catch (err: any) {
      console.error('Error updating email:', err);
      Alert.alert('Error', err.message || 'Failed to change email');
    } finally {
      setSavingEmail(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      "Log Out",
      "Are you sure you want to log out?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Log Out",
          style: "destructive",
          onPress: async () => {
            try {
              await signOut(auth);
              router.replace('/'); // Redirect to login
            } catch (err) {
              console.error('Error signing out:', err);
              Alert.alert('Error', 'Failed to log out');
            }
          }
        }
      ],
      { cancelable: true }
    );
  };
  

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
        <Text>Loading account info...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>My Account</Text>

      <View style={styles.infoBox}>
        <Text style={styles.label}>Email:</Text>
        <Text style={styles.value}>{emailField}</Text>

        <Text style={[styles.label, { marginTop: 16 }]}>Display Name:</Text>
        <TextInput
          style={styles.input}
          value={displayName}
          onChangeText={setDisplayName}
          placeholder="Enter your name"
        />
        <Button title={savingName ? 'Saving...' : 'Save Name'} onPress={handleSaveName} disabled={savingName} />

        {/* 🔘 Toggle Password Change */}
        <Button
          title={showPasswordFields ? 'Cancel Password Change' : 'Change Password'}
          onPress={() => setShowPasswordFields(!showPasswordFields)}
          color={showPasswordFields ? 'gray' : '#006FFD'}
        />

        {showPasswordFields && (
          <>
            <Text style={[styles.label, { marginTop: 24 }]}>Current Password:</Text>
            <TextInput
              style={styles.input}
              value={currentPassword}
              onChangeText={setCurrentPassword}
              placeholder="Enter current password"
              secureTextEntry
            />
            <Text style={styles.label}>New Password:</Text>
            <TextInput
              style={styles.input}
              value={newPassword}
              onChangeText={setNewPassword}
              placeholder="Enter new password"
              secureTextEntry
            />
            <Button
              title={savingPassword ? 'Saving Password...' : 'Save Password'}
              onPress={handleChangePassword}
              disabled={savingPassword}
            />
          </>
        )}

        {/* 📧 Toggle Email Change */}
        <Button
          title={showEmailFields ? 'Cancel Email Change' : 'Change Email'}
          onPress={() => setShowEmailFields(!showEmailFields)}
          color={showEmailFields ? 'gray' : '#006FFD'}
        />

        {showEmailFields && (
          <>
            <Text style={[styles.label, { marginTop: 24 }]}>Current Password:</Text>
            <TextInput
              style={styles.input}
              value={currentEmailPassword}
              onChangeText={setCurrentEmailPassword}
              placeholder="Enter current password"
              secureTextEntry
            />
            <Text style={styles.label}>New Email:</Text>
            <TextInput
              style={styles.input}
              value={newEmail}
              onChangeText={setNewEmail}
              placeholder="Enter new email"
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <Button
              title={savingEmail ? 'Saving Email...' : 'Save Email'}
              onPress={handleChangeEmail}
              disabled={savingEmail}
            />
          </>
        )}

        {/* 🔴 Logout Button */}
        <Button
          title="Log Out"
          onPress={handleLogout}
          color="red"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 100,
    alignItems: 'center',
    backgroundColor: '#fff',
    flex: 1,
  },
  header: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  infoBox: {
    width: '85%',
    padding: 20,
    borderRadius: 12,
    backgroundColor: '#F4F6FA',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    color: '#333',
  },
  value: {
    fontSize: 16,
    color: '#555',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    marginBottom: 16,
    backgroundColor: '#fff',
  },
});

export default AccountScreen;
