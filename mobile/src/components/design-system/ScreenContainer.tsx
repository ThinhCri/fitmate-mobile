import React from 'react';
import { View, StyleSheet, StatusBar, StyleProp, ViewStyle } from 'react-native';
import { SafeAreaView, Edge } from 'react-native-safe-area-context';
import { colors } from '@/theme/designTokens';

export interface ScreenContainerProps {
  children: React.ReactNode;
  edges?: Edge[];
  backgroundColor?: string;
  style?: StyleProp<ViewStyle>;
}

export const ScreenContainer: React.FC<ScreenContainerProps> = ({
  children,
  edges = ['top', 'left', 'right'],
  backgroundColor = colors.background,
  style,
}) => {
  return (
    <SafeAreaView
      edges={edges}
      style={[styles.container, { backgroundColor }, style]}
    >
      <StatusBar
        barStyle="dark-content"
        backgroundColor={backgroundColor}
        translucent={false}
      />
      <View style={styles.content}>{children}</View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
});
