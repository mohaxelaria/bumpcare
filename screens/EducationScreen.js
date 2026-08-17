import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { colors } from '../theme/colors';
import { EDUCATION_ARTICLES } from '../content/educationArticles';
import BottomNav from '../components/BottomNav';

export default function EducationScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Education</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionTitle}>Learn About Your Pregnancy</Text>

        {EDUCATION_ARTICLES.map((article) => (
          <TouchableOpacity
            key={article.id}
            style={styles.card}
            activeOpacity={0.8}
            onPress={() =>
              navigation.navigate('EducationArticle', { id: article.id })
            }
          >
            <Text style={styles.cardIcon}>{article.icon}</Text>
            <Text style={styles.cardTitle}>{article.title}</Text>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <BottomNav navigation={navigation} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  backButton: { width: 32 },
  backArrow: { fontSize: 22, color: colors.textDark },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 17,
    fontWeight: '700',
    color: colors.textDark,
  },
  headerSpacer: { width: 32 },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textDark,
    marginBottom: 14,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  cardIcon: {
    fontSize: 22,
    marginRight: 14,
  },
  cardTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: colors.textDark,
  },
  chevron: {
    fontSize: 22,
    color: colors.textMuted,
    marginLeft: 8,
  },
});
