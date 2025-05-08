import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { JournalEntry } from '../services/journal';

export type RootStackParamList = {
  Login: undefined;
  SignUp: undefined;
  Home: undefined;
  Journal: undefined;
  JournalEntry: { entry: JournalEntry };
  JournalCreate: undefined;
  Profile: undefined;
};

export type RootStackScreenProps<T extends keyof RootStackParamList> = NativeStackScreenProps<
  RootStackParamList,
  T
>;