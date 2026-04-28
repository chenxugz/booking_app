import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { HomeTabParamList } from './types';
import HotelSearchScreen from '../screens/HotelSearchScreen';
import FlightSearchScreen from '../screens/FlightSearchScreen';
import RestaurantSearchScreen from '../screens/RestaurantSearchScreen';
import MyBookingsScreen from '../screens/MyBookingsScreen';
import { Text, TouchableOpacity, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const Tab = createBottomTabNavigator<HomeTabParamList>();

export default function HomeTabNavigator() {
  const insets = useSafeAreaInsets();
  return (
    <Tab.Navigator
      screenOptions={{
        headerRight: () => null,
        tabBarStyle: { paddingBottom: insets.bottom },
      }}
      tabBar={(props) => <CustomTabBar {...props} />}
    >
      <Tab.Screen
        name="Hotels"
        component={HotelSearchScreen}
        options={{ title: 'Hotels' }}
      />
      <Tab.Screen
        name="Flights"
        component={FlightSearchScreen}
        options={{ title: 'Flights' }}
      />
      <Tab.Screen
        name="Restaurants"
        component={RestaurantSearchScreen}
        options={{ title: 'Restaurants' }}
      />
      <Tab.Screen
        name="MyBookings"
        component={MyBookingsScreen}
        options={{ title: 'My Bookings' }}
      />
    </Tab.Navigator>
  );
}

function CustomTabBar({ state, descriptors, navigation }: any) {
  const tabTestIDs = ['tab_hotels', 'tab_flights', 'tab_restaurants', 'tab_my_bookings'];
  return (
    <View style={styles.tabBar}>
      {state.routes.map((route: any, index: number) => {
        const { options } = descriptors[route.key];
        const label = options.title ?? route.name;
        const isFocused = state.index === index;
        return (
          <TouchableOpacity
            key={route.key}
            testID={tabTestIDs[index]}
            accessibilityRole="tab"
            accessibilityState={{ selected: isFocused }}
            onPress={() => {
              if (!isFocused) navigation.navigate(route.name);
            }}
            style={styles.tabItem}
          >
            <Text style={[styles.tabLabel, isFocused && styles.tabLabelActive]}>
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingVertical: 8,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 6,
  },
  tabLabel: {
    fontSize: 11,
    color: '#666',
    fontWeight: '500',
  },
  tabLabelActive: {
    color: '#1976D2',
    fontWeight: '700',
  },
});
