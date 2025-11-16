// src/components/NumericKeypad.tsx

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface NumericKeypadProps {
  onNumberPress: (num: string) => void;
  onBackspace: () => void;
  onClear: () => void;
}

const NumericKeypad: React.FC<NumericKeypadProps> = ({ 
  onNumberPress, 
  onBackspace, 
  onClear 
}) => {
  const numbers = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', '⌫'];

  return (
    <View style={styles.keypad}>
      {numbers.map((num, index) => (
        <TouchableOpacity
          key={index}
          style={styles.key}
          onPress={() => {
            if (num === '⌫') {
              onBackspace();
            } else {
              onNumberPress(num);
            }
          }}
          activeOpacity={0.7}
        >
          <Text style={styles.keyText}>{num}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  keypad: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 20,
  },
  key: {
    width: '30%',
    aspectRatio: 1.5,
    margin: '1.5%',
    backgroundColor: '#3A3B3C',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  keyText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '600',
  },
});

export default NumericKeypad;