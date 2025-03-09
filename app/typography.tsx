import { StyleSheet } from 'react-native';
import { Platform } from 'react-native';



const Typography = StyleSheet.create({

  

  // Heading 1
  logo: {
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
  h2: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
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