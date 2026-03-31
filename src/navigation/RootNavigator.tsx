import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './types';
import HomeTabNavigator from './HomeTabNavigator';
import ResultsScreen from '../screens/ResultsScreen';
import DetailScreen from '../screens/DetailScreen';
import CheckoutScreen from '../screens/CheckoutScreen';
import ConfirmationScreen from '../screens/ConfirmationScreen';
import MyBookingsScreen from '../screens/MyBookingsScreen';
import ExpenseFolderScreen from '../screens/ExpenseFolderScreen';
import ReviewsScreen from '../screens/ReviewsScreen';
import BulkBookingScreen from '../screens/BulkBookingScreen';
import CompensationClaimScreen from '../screens/CompensationClaimScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="HomeTabs">
        <Stack.Screen
          name="HomeTabs"
          component={HomeTabNavigator}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Results"
          component={ResultsScreen}
          options={{ title: 'Search Results' }}
        />
        <Stack.Screen
          name="Detail"
          component={DetailScreen}
          options={{ title: 'Details' }}
        />
        <Stack.Screen
          name="Checkout"
          component={CheckoutScreen}
          options={{ title: 'Checkout' }}
        />
        <Stack.Screen
          name="Confirmation"
          component={ConfirmationScreen}
          options={{ title: 'Booking Confirmed', headerLeft: () => null }}
        />
        <Stack.Screen
          name="MyBookings"
          component={MyBookingsScreen}
          options={{ title: 'My Bookings' }}
        />
        <Stack.Screen
          name="ExpenseFolder"
          component={ExpenseFolderScreen}
          options={{ title: 'Expense Reports' }}
        />
        <Stack.Screen
          name="Reviews"
          component={ReviewsScreen}
          options={{ title: 'Reviews' }}
        />
        <Stack.Screen
          name="BulkBooking"
          component={BulkBookingScreen}
          options={{ title: 'Bulk Booking' }}
        />
        <Stack.Screen
          name="CompensationClaim"
          component={CompensationClaimScreen}
          options={{ title: 'Compensation Claim' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
