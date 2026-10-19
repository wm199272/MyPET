import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import {
  deleteGarment,
  deletePet,
  deleteRecord,
  loadState,
  saveBath,
  saveCheckup,
  saveDeworm,
  saveExpense,
  saveFood,
  saveGarment,
  savePet,
  saveSettings,
  saveVaccine,
  saveWeight,
  wearGarment,
} from '@/src/db';
import {
  ArchiveData,
  BathRecord,
  CheckupRecord,
  DewormRecord,
  ExpenseRecord,
  FoodRecord,
  Garment,
  Pet,
  Plan,
  Settings,
  VaccineRecord,
  WeightRecord,
  WeightUnit,
  defaultSettings,
  emptyArchive,
} from '@/src/domain';
import { rescheduleReminders } from '@/src/notifications';

type StoreValue = {
  ready: boolean;
  data: ArchiveData;
  settings: Settings;
  currentPet: Pet | null;
  toast: string | null;
  showToast: (message: string) => void;
  setWeightUnit: (unit: WeightUnit) => Promise<void>;
  setNotifications: (enabled: boolean) => Promise<void>;
  setCurrentPetId: (id: string) => Promise<void>;
  setPlan: (plan: Plan, expiresAt: string) => Promise<void>;
  savePet: (pet: Pet) => Promise<void>;
  removePet: (id: string) => Promise<void>;
  saveWeight: (row: WeightRecord) => Promise<void>;
  saveCheckup: (row: CheckupRecord) => Promise<void>;
  saveBath: (row: BathRecord) => Promise<void>;
  saveDeworm: (row: DewormRecord) => Promise<void>;
  saveVaccine: (row: VaccineRecord) => Promise<void>;
  saveExpense: (row: ExpenseRecord) => Promise<void>;
  saveFood: (row: FoodRecord) => Promise<void>;
  saveGarment: (row: Garment) => Promise<void>;
  removeGarment: (id: string) => Promise<void>;
  wearGarment: (petId: string, id: string) => Promise<void>;
  removeRecord: (type: 'weight' | 'checkup' | 'bath' | 'deworm' | 'vaccine' | 'expense' | 'food', id: string) => Promise<void>;
};

const StoreContext = createContext<StoreValue | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [data, setData] = useState<ArchiveData>(emptyArchive());
  const [settings, setSettings] = useState<Settings>(defaultSettings());
  const [toast, setToast] = useState<string | null>(null);

  async function refresh() {
    const next = await loadState();
    setData(next.data);
    setSettings(next.settings);
    void rescheduleReminders(next.data, next.settings);
    return next;
  }

  useEffect(() => {
    refresh()
      .catch(() => undefined)
      .finally(() => setReady(true));
  }, []);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = setTimeout(() => setToast(null), 1800);
    return () => clearTimeout(timer);
  }, [toast]);

  const value = useMemo<StoreValue>(() => {
    const currentPet = data.pets.find((pet) => pet.id === settings.currentPetId) ?? data.pets[0] ?? null;
    return {
      ready,
      data,
      settings,
      currentPet,
      toast,
      showToast: (message) => setToast(message),
      setWeightUnit: async (unit) => {
        const next = { ...settings, weightUnit: unit };
        await saveSettings(next);
        setSettings(next);
      },
      setNotifications: async (enabled) => {
        const next = { ...settings, notificationsEnabled: enabled };
        await saveSettings(next);
        setSettings(next);
        void rescheduleReminders(data, next);
      },
      setCurrentPetId: async (id) => {
        const next = { ...settings, currentPetId: id };
        await saveSettings(next);
        setSettings(next);
      },
      setPlan: async (plan, expiresAt) => {
        const next = { ...settings, plan, planExpiresAt: expiresAt };
        await saveSettings(next);
        setSettings(next);
      },
      savePet: async (pet) => {
        await savePet(pet);
        const nextSettings = settings.currentPetId ? settings : { ...settings, currentPetId: pet.id };
        if (!settings.currentPetId) await saveSettings(nextSettings);
        await refresh();
        if (!settings.currentPetId) setSettings((prev) => ({ ...prev, currentPetId: pet.id }));
      },
      removePet: async (id) => {
        await deletePet(id);
        await refresh();
      },
      saveWeight: async (row) => {
        await saveWeight(row);
        await refresh();
      },
      saveCheckup: async (row) => {
        await saveCheckup(row);
        await refresh();
      },
      saveBath: async (row) => {
        await saveBath(row);
        await refresh();
      },
      saveDeworm: async (row) => {
        await saveDeworm(row);
        await refresh();
      },
      saveVaccine: async (row) => {
        await saveVaccine(row);
        await refresh();
      },
      saveExpense: async (row) => {
        await saveExpense(row);
        await refresh();
      },
      saveFood: async (row) => {
        await saveFood(row);
        await refresh();
      },
      saveGarment: async (row) => {
        await saveGarment(row);
        await refresh();
      },
      removeGarment: async (id) => {
        await deleteGarment(id);
        await refresh();
      },
      wearGarment: async (petId, id) => {
        await wearGarment(petId, id);
        await refresh();
      },
      removeRecord: async (type, id) => {
        await deleteRecord(type, id);
        await refresh();
      },
    };
  }, [ready, data, settings, toast]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useArchive() {
  const value = useContext(StoreContext);
  if (!value) throw new Error('档案尚未准备好');
  return value;
}
