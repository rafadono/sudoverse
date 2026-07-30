import { Component, ErrorInfo, ReactNode } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity } from 'react-native';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('SudoVerse crashed:', error, info.componentStack);
  }

  private handleReset = () => {
    this.setState({ error: null });
  };

  render() {
    if (!this.state.error) {
      return this.props.children;
    }

    return (
      <SafeAreaView style={styles.root}>
        <ScrollView contentContainerStyle={styles.container}>
          <Text style={styles.title}>SudoVerse 🧩</Text>
          <Text style={styles.message}>
            Something went wrong and the game crashed.
            {'\n'}
            Algo salió mal y el juego se cayó.
          </Text>
          <TouchableOpacity style={styles.button} onPress={this.handleReset}>
            <Text style={styles.buttonText}>Try again / Reintentar</Text>
          </TouchableOpacity>
          <Text style={styles.details}>{this.state.error.message}</Text>
        </ScrollView>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#f8fafc' },
  container: { padding: 24, gap: 12, alignItems: 'center', justifyContent: 'center', flexGrow: 1 },
  title: { fontSize: 28, fontWeight: '800', color: '#0f172a' },
  message: { fontSize: 15, color: '#334155', textAlign: 'center' },
  button: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 8,
  },
  buttonText: { color: '#ffffff', fontWeight: '700' },
  details: { fontSize: 11, color: '#94a3b8', marginTop: 16, textAlign: 'center' },
});
