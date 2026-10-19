import { router } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

import { LineIcon } from '@/src/components/LineIcon';
import { Button, Card, SectionTitle } from '@/src/components/ui';
import { castFortune } from '@/src/fortune';
import { useArchive } from '@/src/store';
import { colors } from '@/src/theme';

const STEPS = ['走路', '吃饭', '出门', '门口', '要紧', '收尾'];
const BRANCHES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
const NATURE: Record<string, string> = {
  '111': '天',
  '110': '泽',
  '101': '火',
  '100': '雷',
  '011': '风',
  '010': '水',
  '001': '山',
  '000': '地',
};

export default function FortuneScreen() {
  const archive = useArchive();
  if (!archive.ready) return <View style={styles.screen} />;
  const pet = archive.currentPet;
  if (!pet) {
    return (
      <View style={styles.empty}>
        <Text style={styles.quiet}>先添加一只宠物。</Text>
        <Button title="添加宠物" onPress={() => router.push('/pet/new')} />
      </View>
    );
  }
  const fortune = castFortune(pet);
  if (!fortune) {
    return (
      <View style={styles.empty}>
        <Text style={styles.quiet}>先把{pet.name}的生日补上，这一卦才起得出来。</Text>
        <Button title="去补生日" onPress={() => router.push(`/pet/${pet.id}`)} />
      </View>
    );
  }

  const near = fortune.trials.filter((item) => !item.late);
  const late = fortune.trials.filter((item) => item.late);
  const birthYear = Number(pet.birthday.slice(0, 4));

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Card>
        <Text style={styles.name}>{pet.name}</Text>
        <Text style={styles.quiet}>{fortune.who.startsWith(`${pet.name} · `) ? fortune.who.slice(pet.name.length + 3) : fortune.who}</Text>
        <View style={styles.pair}>
          <HexPlate title={fortune.imageName} bits={fortune.bits} moving={fortune.moving} />
          <View style={styles.shift}>
            <Text style={styles.of}>之</Text>
          </View>
          <HexPlate title={fortune.changedName} bits={fortune.changedBits} muted />
        </View>
        <StepRail moving={fortune.moving} />
        <Text style={styles.lineHint}>{fortune.lineLabel}</Text>
      </Card>

      {['今年', '性格', '相处', '身子', '吃和嘴', '以后'].map((heading) => {
        const section = fortune.sections.find((item) => item.heading === heading);
        if (!section) return null;
        return (
          <Card key={section.heading} style={styles.sectionCard}>
            <View style={styles.sectionHead}>
              <Mark heading={section.heading} />
              <Text style={styles.sectionName}>{section.heading}</Text>
            </View>
            <Text style={styles.body}>{section.body}</Text>
            {section.heading === '身子' ? <BranchDial term={section.term} tone="soft" /> : null}
            <TermNote text={section.term} />
          </Card>
        );
      })}

      <SectionTitle title="要留心的年份" />
      <YearRail birthYear={birthYear} trials={fortune.trials} />
      {near.length === 0 ? <Text style={styles.quiet}>{fortune.trialEmpty}</Text> : near.map((item) => (
        <TrialCard key={item.year} year={item.year} title={item.title} body={item.body} term={item.term} />
      ))}
      {late.length > 0 ? (
        <>
          <SectionTitle title="年纪大了" />
          {late.map((item) => <TrialCard key={item.year} year={item.year} title={item.title} body={item.body} term={item.term} late />)}
        </>
      ) : null}

      <Text style={styles.careNote}>{fortune.note}</Text>
      {fortune.sections.filter((section) => section.heading === '生日').map((section) => (
        <Card key={section.heading} style={styles.dateCard}>
          <Text style={styles.sectionName}>{section.heading}</Text>
          <Text style={styles.dateBody}>{section.body}</Text>
          <TermNote text={section.term} />
        </Card>
      ))}
      <TermNote text={fortune.method} />
      <Button title="重新卜卦" variant="quiet" onPress={() => router.back()} style={styles.again} />
    </ScrollView>
  );
}

function HexPlate({ title, bits, moving, muted }: { title: string; bits: string; moving?: number; muted?: boolean }) {
  const lines = bits.split('').map((bit, index) => ({ yang: bit === '1', moving: index + 1 === moving, index }));
  const upper = [...lines.slice(3)].reverse();
  const lower = [...lines.slice(0, 3)].reverse();
  return (
    <View style={[styles.plate, muted ? styles.plateLater : styles.plateNow]}>
      <View style={styles.plateRow}>
        <View style={styles.yaos}>
          {upper.map((line) => <Yao key={`${title}-u-${line.index}`} yang={line.yang} moving={line.moving} muted={muted} />)}
          <View style={styles.trigramGap} />
          {lower.map((line) => <Yao key={`${title}-l-${line.index}`} yang={line.yang} moving={line.moving} muted={muted} />)}
        </View>
        <View style={styles.natures}>
          <Text style={[styles.nature, muted && styles.muted]}>{NATURE[bits.slice(3)] ?? ''}</Text>
          <Text style={[styles.nature, muted && styles.muted]}>{NATURE[bits.slice(0, 3)] ?? ''}</Text>
        </View>
      </View>
      <Text style={[styles.hexTitle, muted && styles.muted]}>{title}</Text>
    </View>
  );
}

function Yao({ yang, moving, muted }: { yang: boolean; moving: boolean; muted?: boolean }) {
  const color = moving ? colors.primary : muted ? colors.textSecondary : colors.text;
  return (
    <View style={[styles.yaoRow, moving && styles.yaoOn]}>
      {yang ? <View style={[styles.yang, { backgroundColor: color }]} /> : (
        <>
          <View style={[styles.yin, { backgroundColor: color }]} />
          <View style={styles.gap} />
          <View style={[styles.yin, { backgroundColor: color }]} />
        </>
      )}
    </View>
  );
}

function StepRail({ moving }: { moving: number }) {
  return (
    <View style={styles.steps}>
      <View style={styles.stepLine} />
      {STEPS.map((label, index) => {
        const on = index + 1 === moving;
        return (
          <View key={label} style={styles.step}>
            <View style={[styles.stepDot, on && styles.stepDotOn]}>
              <Text style={[styles.stepNum, on && styles.stepNumOn]}>{index + 1}</Text>
            </View>
            <Text style={[styles.stepLabel, on && styles.stepLabelOn]}>{label}</Text>
          </View>
        );
      })}
    </View>
  );
}

function YearRail({ birthYear, trials }: { birthYear: number; trials: { year: number; late: boolean }[] }) {
  const start = new Date().getFullYear();
  const end = birthYear + 16;
  if (end < start) return null;
  const years = Array.from({ length: end - start + 1 }, (_, index) => start + index);
  const mark = new Map(trials.map((item) => [item.year, item.late]));
  return (
    <View style={styles.railCard}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} nestedScrollEnabled contentContainerStyle={styles.railContent}>
        {years.map((year) => {
          const late = mark.get(year);
          const on = late !== undefined;
          return (
            <View key={year} style={styles.railYear}>
              <View style={[styles.railDot, on && (late ? styles.railDotLate : styles.railDotNear)]} />
              <Text style={[styles.railLabel, on && styles.railLabelOn]}>{year}</Text>
            </View>
          );
        })}
      </ScrollView>
      <View style={styles.legend}>
        <View style={[styles.legendDot, styles.railDotNear]} />
        <Text style={styles.legendText}>要留心</Text>
        <View style={[styles.legendDot, styles.railDotLate]} />
        <Text style={styles.legendText}>年纪大了</Text>
      </View>
    </View>
  );
}

function BranchDial({ term, tone = 'danger' }: { term: string; tone?: 'danger' | 'warn' | 'soft' }) {
  const found = term.match(/([子丑寅卯辰巳午未申酉戌亥])月/);
  if (!found) return null;
  const hot = found[1];
  const onStyle = tone === 'warn' ? styles.dialLate : tone === 'soft' ? styles.dialSoft : styles.dialOn;
  return (
    <View style={styles.dial}>
      {BRANCHES.map((branch) => {
        const on = branch === hot;
        return (
          <View key={branch} style={[styles.dialCell, on && onStyle]}>
            <Text style={[styles.dialText, on && (tone === 'warn' ? styles.dialTextWarn : styles.dialTextOn)]}>{branch}</Text>
          </View>
        );
      })}
    </View>
  );
}

function Mark({ heading }: { heading: string }) {
  const pen = { fill: 'none' as const, stroke: colors.primary, strokeWidth: 1.6, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  return (
    <View style={styles.mark}>
      {heading === '今年' ? <LineIcon name="stats" size={20} color={colors.primary} /> : null}
      {heading === '性格' ? <LineIcon name="paw" size={20} color={colors.primary} /> : null}
      {heading === '吃和嘴' ? <LineIcon name="bowl" size={20} color={colors.primary} /> : null}
      {heading === '性格' || heading === '今年' || heading === '吃和嘴' ? null : (
      <Svg width={22} height={22} viewBox="0 0 24 24">
        {heading === '相处' ? <Path {...pen} d="M8 8.5a2.2 2.2 0 1 0 0-4.4 2.2 2.2 0 0 0 0 4.4zM16 10a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM5.2 18.5c.6-2.2 2.2-3.4 4.6-3.4 1.6 0 2.8.6 3.6 1.6M12.2 16.8c.7-1.4 2-2.2 3.8-2.2 1.6 0 2.8.7 3.4 2" /> : null}
        {heading === '眼下' ? (
          <>
            <Path {...pen} d="M7 6h10M7 12h10M7 18h4M13 18h4" />
            <Circle cx="18.5" cy="12" r="2.2" fill={colors.primary} stroke="none" />
          </>
        ) : null}
        {heading === '以后' ? <Path {...pen} d="M5 12h12M13 7l5 5-5 5" /> : null}
        {heading === '生日' ? (
          <>
            <Path {...pen} d="M6 5.5h12v13H6zM6 9.5h12M9 4v3M15 4v3" />
            <Circle cx="12" cy="14" r="1.3" fill={colors.primary} stroke="none" />
          </>
        ) : null}
        {heading === '身子' ? <Path {...pen} d="M12 4.5v15M9 8.5c1.6 1.2 4.4 1.2 6 0M9 15.5c1.6-1.2 4.4-1.2 6 0" /> : null}
      </Svg>
      )}
    </View>
  );
}

function TermNote({ text }: { text: string }) {
  if (!text) return null;
  return (
    <View style={styles.termBox}>
      <Text style={styles.termLabel}>术语</Text>
      <Text style={styles.term}>{text}</Text>
    </View>
  );
}

function TrialCard({ year, title, body, term, late }: { year: number; title: string; body: string; term: string; late?: boolean }) {
  const age = title.includes('·') ? title.slice(title.indexOf('·') + 1).trim() : title;
  return (
    <View style={styles.trial}>
      <View style={[styles.yearBadge, { backgroundColor: late ? colors.warnSoft : colors.dangerSoft }]}>
        <Text style={[styles.yearNum, { color: late ? colors.warn : colors.danger }]}>{year}</Text>
        <Text style={styles.ageLabel}>{age}</Text>
      </View>
      <Text style={styles.trialText}>{body}</Text>
      <BranchDial term={term} tone={late ? 'warn' : 'danger'} />
      <TermNote text={term} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 20, paddingBottom: 40 },
  empty: { flex: 1, backgroundColor: colors.bg, padding: 24, justifyContent: 'center', gap: 16 },
  name: { fontSize: 22, fontWeight: '500', color: colors.text, lineHeight: 30 },
  quiet: { color: colors.textSecondary, fontSize: 14, lineHeight: 22 },
  pair: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 16 },
  plate: { flex: 1, borderRadius: 16, paddingVertical: 14, paddingHorizontal: 10, alignItems: 'center' },
  plateNow: { backgroundColor: colors.primarySoft },
  plateLater: { backgroundColor: colors.sageSoft },
  plateRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  yaos: { width: 72, gap: 5 },
  trigramGap: { height: 8 },
  natures: { height: 78, justifyContent: 'space-between', paddingVertical: 6 },
  nature: { fontSize: 13, lineHeight: 18, color: colors.text, fontWeight: '500' },
  yaoRow: { flexDirection: 'row', height: 8, alignItems: 'center', borderRadius: 4 },
  yaoOn: { backgroundColor: colors.white },
  yang: { flex: 1, height: 6, borderRadius: 3 },
  yin: { flex: 1, height: 6, borderRadius: 3 },
  gap: { width: 8 },
  hexTitle: { marginTop: 10, fontSize: 14, fontWeight: '500', color: colors.text, textAlign: 'center', lineHeight: 20 },
  muted: { color: colors.textSecondary },
  shift: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  of: { color: colors.primary, fontSize: 15, fontWeight: '600' },
  steps: { flexDirection: 'row', marginTop: 18, position: 'relative' },
  stepLine: { position: 'absolute', left: 18, right: 18, top: 10, height: 2, backgroundColor: colors.line },
  step: { flex: 1, alignItems: 'center' },
  stepDot: { width: 22, height: 22, borderRadius: 11, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line, alignItems: 'center', justifyContent: 'center' },
  stepDotOn: { backgroundColor: colors.primary, borderColor: colors.primary },
  stepNum: { fontSize: 11, lineHeight: 14, color: colors.textSecondary, fontVariant: ['tabular-nums'] },
  stepNumOn: { color: colors.white, fontWeight: '600' },
  stepLabel: { marginTop: 6, fontSize: 12, lineHeight: 16, color: colors.textSecondary },
  stepLabelOn: { color: colors.primary, fontWeight: '600' },
  lineHint: { marginTop: 12, fontSize: 15, lineHeight: 24, color: colors.text },
  sectionCard: { marginTop: 12 },
  sectionHead: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  mark: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  sectionName: { fontSize: 16, fontWeight: '500', color: colors.text, lineHeight: 24 },
  body: { fontSize: 16, lineHeight: 26, color: colors.text },
  dateCard: { marginTop: 12 },
  dateBody: { marginTop: 8, fontSize: 14, lineHeight: 22, color: colors.text },
  careNote: { marginTop: 16, fontSize: 15, lineHeight: 24, color: colors.text },
  railCard: { backgroundColor: colors.card, borderRadius: 20, paddingVertical: 14, marginBottom: 10 },
  railContent: { paddingHorizontal: 12, gap: 4 },
  railYear: { width: 52, alignItems: 'center' },
  railDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: colors.line, marginBottom: 8 },
  railDotNear: { backgroundColor: colors.danger },
  railDotLate: { backgroundColor: colors.warn },
  railLabel: { fontSize: 12, lineHeight: 16, color: colors.textSecondary, fontVariant: ['tabular-nums'] },
  railLabelOn: { color: colors.text, fontWeight: '500' },
  legend: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 16, marginTop: 12 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: 12, lineHeight: 18, color: colors.textSecondary, marginRight: 8 },
  dial: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 14 },
  dialCell: { width: 36, height: 36, borderRadius: 18, borderWidth: 1, borderColor: colors.line, alignItems: 'center', justifyContent: 'center' },
  dialOn: { backgroundColor: colors.danger, borderColor: colors.danger },
  dialLate: { backgroundColor: colors.warn, borderColor: colors.warn },
  dialSoft: { backgroundColor: colors.primary, borderColor: colors.primary },
  dialText: { fontSize: 13, lineHeight: 18, color: colors.textSecondary },
  dialTextOn: { color: colors.white, fontWeight: '600' },
  dialTextWarn: { color: colors.text, fontWeight: '600' },
  trial: { backgroundColor: colors.card, borderRadius: 20, padding: 14, marginBottom: 10 },
  yearBadge: { alignSelf: 'flex-start', borderRadius: 14, paddingHorizontal: 12, paddingVertical: 8, marginBottom: 10 },
  yearNum: { fontSize: 20, lineHeight: 26, fontWeight: '600', fontVariant: ['tabular-nums'] },
  ageLabel: { fontSize: 12, lineHeight: 18, color: colors.textSecondary },
  trialText: { fontSize: 15, lineHeight: 24, color: colors.text },
  termBox: { marginTop: 14, paddingTop: 12, borderTopWidth: 1, borderTopColor: colors.line },
  termLabel: { fontSize: 12, lineHeight: 18, color: colors.textSecondary },
  term: { marginTop: 2, fontSize: 13, lineHeight: 20, color: colors.textSecondary },
  footnote: { marginTop: 18, color: colors.textSecondary, fontSize: 13, lineHeight: 20 },
  again: { marginTop: 8 },
});
