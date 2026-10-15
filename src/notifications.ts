import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { ArchiveData, Pet, Settings, addDays, diffDays, forecastFood, latestByDate, todayISO } from '@/src/domain';

if (Platform.OS !== 'web') {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

type Plan = { when: Date; body: string };

export async function rescheduleReminders(data: ArchiveData, settings: Settings) {
  if (Platform.OS === 'web') return;
  try {
    const current = await Notifications.getPermissionsAsync();
    const permission = current.granted ? current : await Notifications.requestPermissionsAsync();
    await Notifications.cancelAllScheduledNotificationsAsync();
    if (!permission.granted || !settings.notificationsEnabled) return;

    const plans = collectPlans(data, settings).slice(0, 48);
    for (const plan of plans) {
      await Notifications.scheduleNotificationAsync({
        content: { title: 'MyPET', body: plan.body },
        trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: plan.when },
      });
    }
  } catch {
    // 通知权限或系统限制失败时，记录本身仍然保留。
  }
}

function collectPlans(data: ArchiveData, settings: Settings): Plan[] {
  const today = todayISO();
  const plans: Plan[] = [];
  data.pets.forEach((pet) => {
    if (!pet.remindersEnabled) return;
    data.foods
      .filter((food) => food.petId === pet.id && food.remaining !== 'finished' && food.expiresOn)
      .forEach((food) => {
        queue(plans, pet, food.expiresOn, [7, 0], today, `${pet.name} 的 ${food.brand} 快到保质期了`);
      });
    data.foods
      .filter((food) => food.petId === pet.id)
      .forEach((food) => {
        const forecast = forecastFood(pet, data.weights, food, today);
        if (forecast) queue(plans, pet, forecast.finishOn, [7, 0], today, `${pet.name} 的${food.brand}快吃完了，可以准备买粮`);
      });
    const internal = latestByDate(data.deworms.filter((row) => row.petId === pet.id && (row.type === 'internal' || row.type === 'both')));
    if (internal) {
      queue(plans, pet, internal.nextDate || addDays(internal.date, pet.dewormInternalInterval), [3, 0], today, `${pet.name} 该做体内驱虫了`);
    }
    const external = latestByDate(data.deworms.filter((row) => row.petId === pet.id && (row.type === 'external' || row.type === 'both')));
    if (external) {
      queue(plans, pet, external.nextDate || addDays(external.date, pet.dewormExternalInterval), [3, 0], today, `${pet.name} 该做体外驱虫了`);
    }
    data.vaccines
      .filter((row) => row.petId === pet.id && row.nextDate)
      .forEach((row) => queue(plans, pet, row.nextDate, [3, 0], today, `${pet.name} 的${row.name}快到下一针了`));
    data.checkups
      .filter((row) => row.petId === pet.id && row.nextDate)
      .forEach((row) => queue(plans, pet, row.nextDate, [3, 0], today, `${pet.name} 快到下次体检了`));
  });
  return plans.sort((a, b) => a.when.getTime() - b.when.getTime());
}

function queue(plans: Plan[], _pet: Pet, due: string, offsets: number[], today: string, body: string) {
  offsets.forEach((offset) => {
    const when = dateAtNine(addDays(due, -offset));
    if (diffDays(today, addDays(due, -offset)) < 0) return;
    if (when.getTime() <= Date.now()) return;
    plans.push({ when, body });
  });
}

function dateAtNine(iso: string): Date {
  const date = new Date(`${iso}T09:00:00`);
  return date;
}
