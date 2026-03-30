import { NavigatorScreenParams } from '@react-navigation/native';

export type HomeTabParamList = {
  Hotels: undefined;
  Flights: undefined;
  Restaurants: undefined;
};

export type RootStackParamList = {
  HomeTabs: NavigatorScreenParams<HomeTabParamList> | undefined;
  Results: { type: 'hotel' | 'flight' | 'restaurant' };
  Detail: { type: 'hotel' | 'flight' | 'restaurant'; itemId: string };
  Checkout: { type: 'hotel' | 'flight' | 'restaurant' };
  Confirmation: undefined;
  MyBookings: undefined;
};
