import { useNavigation } from 'expo-router';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { CoinSpin } from '@/src/components/CoinSpin';
import { Button, Card, Field, TextField } from '@/src/components/ui';
import { castCoins, throwOnce, type CoinFace, type CoinReading, type CoinThrow } from '@/src/fortune';
import { useArchive } from '@/src/store';
import { colors } from '@/src/theme';

const ROLL_PLAIN: Record<CoinThrow['value'], string> = {
  6: '断的，会变',
  7: '整的，不动',
  8: '断的，不动',
  9: '整的，会变',
};

export default function CoinScreen() {
  const archive = useArchive();
  const navigation = useNavigation();
  const pet = archive.currentPet;
  const [question, setQuestion] = useState('');
  const [error, setError] = useState('');
  const [rolls, setRolls] = useState<CoinThrow[]>([]);
  const [phase, setPhase] = useState<'ask' | 'shake' | 'read'>('ask');
  const [shaking, setShaking] = useState(false);
  const [reading, setReading] = useState<CoinReading | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  useLayoutEffect(() => {
    const title = phase === 'ask' ? '摇铜钱' : phase === 'shake' ? '正在摇' : '这一摇';
    navigation.setOptions({ title });
  }, [navigation, phase]);

  if (!archive.ready) return <View style={styles.screen} />;
  if (!pet) {
    return (
      <View style={styles.empty}>
        <Text style={styles.quiet}>先添加一只宠物。</Text>
      </View>
    );
  }

  function begin() {
    if (!question.trim()) {
      setError('先写你要问的这一件');
      return;
    }
    setRolls([]);
    setReading(null);
    setPhase('shake');
  }

  function shake() {
    if (shaking || rolls.length >= 6 || !pet) return;
    setShaking(true);
    timer.current = setTimeout(() => {
      const next = [...rolls, throwOnce()];
      setRolls(next);
      setShaking(false);
      if (next.length === 6) {
        setReading(castCoins(question, pet.gender, next));
        setPhase('read');
      }
    }, 1200);
  }

  function again() {
    setRolls([]);
    setReading(null);
    setPhase('ask');
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <Text style={styles.name}>{pet.name}</Text>
      {phase === 'ask' ? (
        <>
          <Text style={styles.lead}>一次只问一件眼前的事。三枚铜钱摇六次，从下往上排。这一摇不改生日那一卦。</Text>
          <Field label="你要问的事" error={error}>
            <TextField
              value={question}
              onChangeText={(value) => { setQuestion(value); setError(''); }}
              placeholder="比如这阵子不吃饭，要不要寄养"
              multiline
              maxLength={120}
            />
          </Field>
          <Button title="开始摇" onPress={begin} />
        </>
      ) : null}

      {phase === 'shake' ? (
        <>
          <Text style={styles.lead}>你问的是：{question.trim()}。有字的那一面叫「字」，另一面叫「背」。三枚都是字，或者三枚都是背，这根会变。刚摇的排在最上面，第一次留在最底下。</Text>
          {shaking ? <CoinSpin /> : (
            <View style={styles.coinRow}>
              {[0, 1, 2].map((index) => (
                <Coin key={index} face={rolls[rolls.length - 1]?.faces[index]} />
              ))}
            </View>
          )}
          <Text style={styles.count}>{shaking ? '铜钱还在转' : rolls.length === 0 ? '还没摇' : `第 ${rolls.length} 次：${ROLL_PLAIN[rolls[rolls.length - 1].value]}`}</Text>
          <View style={styles.stack}>
            {[...rolls].reverse().map((roll, index) => {
              const number = rolls.length - index;
              return (
                <View key={number} style={styles.stackRow}>
                  <Text style={styles.stackNum}>{number}</Text>
                  <Yao yang={roll.value === 7 || roll.value === 9} moving={roll.value === 6 || roll.value === 9} />
                  <Text style={[styles.stackLabel, (roll.value === 6 || roll.value === 9) && styles.stackOn]}>{ROLL_PLAIN[roll.value]}</Text>
                </View>
              );
            })}
          </View>
          <Button title={shaking ? '铜钱还在转' : `摇第 ${rolls.length + 1} 次`} onPress={shake} disabled={shaking} />
        </>
      ) : null}

      {phase === 'read' && reading ? <CoinResult reading={reading} onAgain={again} /> : null}
    </ScrollView>
  );
}

function CoinResult({ reading, onAgain }: { reading: CoinReading; onAgain: () => void }) {
  const changed = reading.moving.length > 0;
  return (
    <>
      <Text style={styles.asked}>你问的是：{reading.question}</Text>
      <Card>
        <VerdictSeal verdict={reading.verdict} title={reading.title} />
        <Text style={styles.summary}>{reading.summary}</Text>
        <View style={styles.pair}>
          <HexPlate title={reading.imageName} bits={reading.bits} moving={reading.moving} caption="眼下" />
          {changed ? (
            <>
              <View style={styles.shift}><Text style={styles.of}>之</Text></View>
              <HexPlate title={reading.changedName} bits={reading.changedBits} muted caption="过后" />
            </>
          ) : (
            <View style={styles.same}>
              <Text style={styles.sameText}>过后还是这一卦</Text>
            </View>
          )}
        </View>
        <ThrowMarks rolls={reading.rolls} />
        <TermNote text={reading.term} />
      </Card>
      <Text style={styles.note}>{reading.note}</Text>
      <Card style={styles.sectionCard}>
        <TermNote text={reading.method} />
      </Card>
      <Button title="再问一次" variant="quiet" onPress={onAgain} style={styles.again} />
    </>
  );
}

const SEAL: Record<CoinReading['verdict'], { mark: string; color: string; soft: string }> = {
  yes: { mark: '可', color: colors.sage, soft: colors.sageSoft },
  hold: { mark: '守', color: colors.textSecondary, soft: colors.line },
  wait: { mark: '缓', color: colors.warn, soft: colors.warnSoft },
  turn: { mark: '变', color: colors.primary, soft: colors.primarySoft },
  flip: { mark: '翻', color: colors.danger, soft: colors.dangerSoft },
};

function VerdictSeal({ verdict, title }: { verdict: CoinReading['verdict']; title: string }) {
  const seal = SEAL[verdict];
  return (
    <View style={styles.sealRow}>
      <View style={[styles.seal, { backgroundColor: seal.soft, borderColor: seal.color }]}>
        <Text style={[styles.sealMark, { color: seal.color }]}>{seal.mark}</Text>
      </View>
      <Text style={styles.sealTitle}>{title}</Text>
    </View>
  );
}

function ThrowMarks({ rolls }: { rolls: CoinThrow[] }) {
  return (
    <View style={styles.marks}>
      {rolls.map((roll, index) => {
        const on = roll.value === 6 || roll.value === 9;
        const yang = roll.value === 7 || roll.value === 9;
        return (
          <View key={index} style={styles.markCol}>
            <Text style={[styles.markNum, on && styles.markOn]}>{index + 1}</Text>
            <View style={styles.markLine}>
              {yang ? <View style={[styles.markYang, on && styles.markHot]} /> : (
                <>
                  <View style={[styles.markYin, on && styles.markHot]} />
                  <View style={styles.markGap} />
                  <View style={[styles.markYin, on && styles.markHot]} />
                </>
              )}
            </View>
            <Text style={[styles.markLabel, on && styles.markOn]}>{on ? '变' : '不动'}</Text>
          </View>
        );
      })}
    </View>
  );
}

function Coin({ face }: { face?: CoinFace }) {
  const label = face === 'character' ? '字' : face === 'back' ? '背' : '…';
  return (
    <View style={[styles.coin, face === 'back' && styles.coinBack, !face && styles.coinWait]}>
      <Text style={[styles.coinText, face === 'back' && styles.coinTextBack]}>{label}</Text>
    </View>
  );
}

function HexPlate({ title, bits, moving = [], muted, caption }: { title: string; bits: string; moving?: number[]; muted?: boolean; caption?: string }) {
  const lines = bits.split('').map((bit, index) => ({ yang: bit === '1', moving: moving.includes(index + 1), index }));
  const upper = [...lines.slice(3)].reverse();
  const lower = [...lines.slice(0, 3)].reverse();
  return (
    <View style={[styles.plate, muted ? styles.plateLater : styles.plateNow]}>
      {caption ? <Text style={[styles.caption, muted && styles.muted]}>{caption}</Text> : null}
      <View style={styles.yaos}>
        {upper.map((line) => <Yao key={`${title}-u-${line.index}`} yang={line.yang} moving={line.moving} muted={muted} />)}
        <View style={styles.trigramGap} />
        {lower.map((line) => <Yao key={`${title}-l-${line.index}`} yang={line.yang} moving={line.moving} muted={muted} />)}
      </View>
      <Text style={[styles.hexTitle, muted && styles.muted]}>{title}</Text>
    </View>
  );
}

function Yao({ yang, moving, muted }: { yang: boolean; moving: boolean; muted?: boolean }) {
  const color = moving ? colors.primary : muted ? colors.textSecondary : colors.text;
  return (
    <View style={styles.yaoRow}>
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

function TermNote({ text }: { text: string }) {
  if (!text) return null;
  return (
    <View style={styles.termBox}>
      <Text style={styles.termLabel}>术语</Text>
      <Text style={styles.term}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 20, paddingBottom: 40 },
  empty: { flex: 1, backgroundColor: colors.bg, padding: 24, justifyContent: 'center' },
  name: { fontSize: 22, fontWeight: '500', color: colors.text, lineHeight: 30 },
  lead: { marginTop: 8, marginBottom: 20, color: colors.textSecondary, fontSize: 14, lineHeight: 22 },
  quiet: { color: colors.textSecondary, fontSize: 14, lineHeight: 22 },
  coinRow: { flexDirection: 'row', justifyContent: 'center', gap: 16, marginBottom: 12 },
  coin: { width: 72, height: 72, borderRadius: 36, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  coinBack: { backgroundColor: colors.sageSoft },
  coinWait: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line },
  coinText: { fontSize: 22, fontWeight: '600', color: colors.primary },
  coinTextBack: { color: colors.sage },
  count: { textAlign: 'center', color: colors.text, fontSize: 15, lineHeight: 22, marginBottom: 16 },
  stack: { gap: 8, marginBottom: 20 },
  stackRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  stackNum: { width: 16, textAlign: 'center', color: colors.textSecondary, fontSize: 13 },
  stackLabel: { color: colors.textSecondary, fontSize: 13, lineHeight: 18 },
  stackOn: { color: colors.primary, fontWeight: '600' },
  yaoRow: { width: 72, flexDirection: 'row', height: 8, alignItems: 'center' },
  yang: { flex: 1, height: 6, borderRadius: 3 },
  yin: { flex: 1, height: 6, borderRadius: 3 },
  gap: { width: 8 },
  pair: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  plate: { flex: 1, borderRadius: 16, paddingVertical: 14, paddingHorizontal: 10, alignItems: 'center' },
  plateNow: { backgroundColor: colors.primarySoft },
  plateLater: { backgroundColor: colors.sageSoft },
  yaos: { width: 72, gap: 5 },
  trigramGap: { height: 8 },
  hexTitle: { marginTop: 10, fontSize: 14, fontWeight: '500', color: colors.text, textAlign: 'center', lineHeight: 20 },
  muted: { color: colors.textSecondary },
  shift: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  of: { color: colors.primary, fontSize: 15, fontWeight: '600' },
  asked: { marginTop: 8, marginBottom: 12, color: colors.textSecondary, fontSize: 14, lineHeight: 22 },
  sealRow: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 8 },
  seal: { width: 64, height: 64, borderRadius: 32, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  sealMark: { fontSize: 28, fontWeight: '600', lineHeight: 34 },
  sealTitle: { flex: 1, fontSize: 22, fontWeight: '600', color: colors.text, lineHeight: 30 },
  summary: { fontSize: 16, lineHeight: 26, color: colors.text, marginBottom: 16 },
  caption: { fontSize: 12, lineHeight: 18, color: colors.textSecondary, marginBottom: 8 },
  same: { flex: 1, minHeight: 88, borderRadius: 16, backgroundColor: colors.line, alignItems: 'center', justifyContent: 'center', padding: 12 },
  sameText: { fontSize: 14, lineHeight: 22, color: colors.text, textAlign: 'center' },
  marks: { flexDirection: 'row', marginTop: 16 },
  markCol: { flex: 1, alignItems: 'center', gap: 6 },
  markNum: { fontSize: 12, lineHeight: 16, color: colors.textSecondary },
  markLine: { width: 28, height: 8, flexDirection: 'row', alignItems: 'center' },
  markYang: { flex: 1, height: 4, borderRadius: 2, backgroundColor: colors.text },
  markYin: { flex: 1, height: 4, borderRadius: 2, backgroundColor: colors.text },
  markGap: { width: 4 },
  markHot: { backgroundColor: colors.primary },
  markLabel: { fontSize: 11, lineHeight: 16, color: colors.textSecondary },
  markOn: { color: colors.primary, fontWeight: '600' },
  sectionCard: { marginTop: 12 },
  sectionName: { fontSize: 16, fontWeight: '500', color: colors.text, lineHeight: 24, marginBottom: 8 },
  body: { fontSize: 16, lineHeight: 26, color: colors.text },
  note: { marginTop: 16, fontSize: 15, lineHeight: 24, color: colors.text },
  termBox: { marginTop: 14, paddingTop: 12, borderTopWidth: 1, borderTopColor: colors.line },
  termLabel: { fontSize: 12, lineHeight: 18, color: colors.textSecondary },
  term: { marginTop: 2, fontSize: 13, lineHeight: 20, color: colors.textSecondary },
  again: { marginTop: 8 },
});
