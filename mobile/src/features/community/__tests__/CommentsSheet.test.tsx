import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import { CommentsSheet } from '../CommentsSheet';

vi.mock('react-native', async () => {
  const { createElement } = await import('react');
  const container = ({ children }: { children?: React.ReactNode }) => createElement('div', null, children);
  return {
    Platform: { OS: 'android' }, StyleSheet: { create: (styles: unknown) => styles },
    Modal: container, View: container, ScrollView: container, Text: container,
    KeyboardAvoidingView: ({ children, behavior }: { children?: React.ReactNode; behavior: string }) =>
      createElement('main', { 'data-keyboard-behavior': behavior }, children),
    TextInput: ({ accessibilityLabel }: { accessibilityLabel: string }) => createElement('input', { 'aria-label': accessibilityLabel }),
    TouchableOpacity: ({ children, accessibilityLabel, disabled }: { children?: React.ReactNode; accessibilityLabel?: string; disabled?: boolean }) =>
      createElement('button', { 'aria-label': accessibilityLabel, disabled }, children),
  };
});
vi.mock('react-native-safe-area-context', async () => {
  const { createElement } = await import('react');
  return {
    SafeAreaProvider: ({ children }: { children?: React.ReactNode }) => createElement('aside', { 'data-modal-insets': true }, children),
    SafeAreaView: ({ children, edges }: { children?: React.ReactNode; edges: string[] }) =>
      createElement('section', { 'data-safe-edges': edges.join(',') }, children),
  };
});
vi.mock('lucide-react-native', () => ({ Heart: () => null, Send: () => null, X: () => null }));
vi.mock('@/components/design-system/Avatar', () => ({ Avatar: () => null }));

describe('CommentsSheet Android layout', () => {
  it('keeps the input and send control inside modal-local bottom safe area and keyboard avoidance', () => {
    const html = renderToStaticMarkup(<CommentsSheet visible post={null} onClose={vi.fn()}
      onSend={async () => true} onLike={async () => {}} />);
    expect(html).toContain('data-modal-insets="true"');
    expect(html).toContain('data-keyboard-behavior="height"');
    expect(html).toMatch(/<section data-safe-edges="bottom,left,right">.*aria-label="Nội dung bình luận".*aria-label="Gửi bình luận".*<\/section>/s);
    expect(html).toContain('aria-label="Đóng bình luận"');
  });
});
