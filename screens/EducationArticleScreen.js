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
import { getArticleById } from '../content/educationArticles';

const WARNING_AMBER = '#C98A2C';
const URGENT_RED = '#D14343';

function Block({ block }) {
  if (block.type === 'paragraph') {
    return <Text style={styles.paragraph}>{block.text}</Text>;
  }

  if (block.type === 'bullets') {
    return (
      <View style={styles.bulletList}>
        {block.items.map((item, i) => (
          <View key={i} style={styles.bulletRow}>
            <Text style={styles.bulletDot}>•</Text>
            <Text style={styles.bulletText}>{item}</Text>
          </View>
        ))}
      </View>
    );
  }

  if (block.type === 'callout') {
    const urgent = block.tone === 'urgent';
    return (
      <View
        style={[
          styles.callout,
          { borderColor: urgent ? URGENT_RED : WARNING_AMBER },
        ]}
      >
        <Text
          style={[
            styles.calloutText,
            { color: urgent ? URGENT_RED : WARNING_AMBER },
          ]}
        >
          {urgent ? '⚠ ' : 'ℹ '}
          {block.text}
        </Text>
      </View>
    );
  }

  if (block.type === 'glossary') {
    return (
      <View style={styles.glossaryList}>
        {block.items.map((item) => (
          <View key={item.term} style={styles.glossaryRow}>
            <Text style={styles.glossaryTerm}>{item.term}</Text>
            <Text style={styles.glossaryDefinition}>{item.definition}</Text>
          </View>
        ))}
      </View>
    );
  }

  return null;
}

export default function EducationArticleScreen({ navigation, route }) {
  const { id } = route?.params || {};
  const article = getArticleById(id);

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
        <Text style={styles.headerTitle} numberOfLines={1}>
          {article ? article.title : 'Education'}
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {article ? (
          <>
            <Text style={styles.icon}>{article.icon}</Text>
            <Text style={styles.title}>{article.title}</Text>
            {article.blocks.map((block, i) => (
              <Block key={i} block={block} />
            ))}
          </>
        ) : (
          <Text style={styles.paragraph}>Article not found.</Text>
        )}
      </ScrollView>
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
    fontSize: 15,
    fontWeight: '700',
    color: colors.textDark,
    paddingHorizontal: 8,
  },
  headerSpacer: { width: 32 },
  content: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  icon: {
    fontSize: 34,
    marginBottom: 8,
  },
  title: {
    fontSize: 21,
    fontWeight: 'bold',
    color: colors.textDark,
    marginBottom: 18,
  },
  paragraph: {
    fontSize: 14,
    lineHeight: 21,
    color: colors.textDark,
    marginBottom: 14,
  },
  bulletList: {
    marginBottom: 14,
  },
  bulletRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  bulletDot: {
    fontSize: 14,
    color: colors.primary,
    marginRight: 8,
    lineHeight: 20,
  },
  bulletText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    color: colors.textDark,
  },
  callout: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    marginBottom: 14,
  },
  calloutText: {
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '600',
  },
  glossaryList: {
    marginBottom: 14,
  },
  glossaryRow: {
    marginBottom: 12,
  },
  glossaryTerm: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textDark,
    marginBottom: 2,
  },
  glossaryDefinition: {
    fontSize: 13,
    lineHeight: 19,
    color: colors.textMuted,
  },
});
