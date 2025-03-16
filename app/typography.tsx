import { StyleSheet } from 'react-native';
import { Platform } from 'react-native';



const Typography = StyleSheet.create({

  

  heroHeading: {
    fontFamily: Platform.select({
      android: 'Inter_800ExtraBold',
      ios: 'Inter-ExtraBold',
    }),
    fontSize: 96,
    fontWeight: "800",
    fontStyle: "normal",
    color: "#1F2024",
    textShadowColor: "rgba(31, 32, 36, 0.25)",
    textShadowOffset: {
	      width: 0,
	      height: 4
      },
    textShadowRadius: 14.800000190734863,
    shadowOpacity: .15,

  },
  
  bodySize12: {
    fontFamily: Platform.select({
      android: 'Inter_400Regular',
      ios: 'Inter-Regular',}),
  fontSize: 12,
  fontWeight: "400",
  fontStyle: "normal",
  lineHeight: 12,
  textAlign: "center",
  color: "#1F2024"
  },

  h1: {
    fontFamily: Platform.select({
      android: 'Inter_800ExtraBold',
      ios: 'Inter-ExtraBold'}),
    fontSize: 24,
    fontWeight: "800",
    color: "#1F2024",
  },

  h2: {
    fontFamily: Platform.select({
      android: 'Inter_800ExtraBold',
      ios: 'Inter-ExtraBold'}),
    fontSize: 18,
    fontWeight: "800",
    color: "#1F2024",
  },

  h3: {
    fontFamily: Platform.select({
      android: 'Inter_800ExtraBold',
      ios: 'Inter-ExtraBold'}),
    fontSize: 16,
    fontWeight: "800",
    color: "#1F2024",
  },
  h4: {
    fontFamily: Platform.select({
      android: 'Inter_800ExtraBold',
      ios: 'Inter-ExtraBold'}),
    fontSize: 14,
    fontWeight: "800",
    color: "#1F2024",
  },
  h5: {
    fontFamily: Platform.select({
      android: 'Inter_800ExtraBold',
      ios: 'Inter-ExtraBold'}),
    fontSize: 12,
    fontWeight: "800",
    color: "#1F2024",
  },
  

  centered: {
    textAlign: 'center',  // Center text horizontally
  },
  // etc...

  coolBlue: {

    backgroundColor: '#006FFD',

  }


});

export default Typography;