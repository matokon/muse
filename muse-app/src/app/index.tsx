import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { deleteToken, getToken, saveToken } from '@/lib/token-storage';

export default function Index() {
  const [result, setResult] = useState('sprawdzam...');

  useEffect(() => {
    async function smokeTest() {
      try {
        await saveToken('testowy-token-123');
        const read = await getToken();
        await deleteToken();
        const afterDelete = await getToken();

        setResult(
          `zapisano i odczytano: ${read}\n` + `po skasowaniu: ${String(afterDelete)}`
        );
      } catch (error) {
        setResult(`blad: ${String(error)}`);
      }
    }

    smokeTest();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.text}>{result}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  text: { textAlign: 'center' },
});
