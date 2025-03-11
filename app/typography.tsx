import { StyleSheet } from 'react-native';
import { Platform } from 'react-native';



const Typography = StyleSheet.create({

  

  // Heading 1
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
  // Heading 2
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
  // Heading 3
  h3: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
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