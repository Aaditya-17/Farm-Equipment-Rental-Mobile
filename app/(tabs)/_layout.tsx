import { Tabs } from "expo-router";
import React from "react";
import { Platform, StyleSheet, View } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";

export default function TabLayout() {
    return (
        <Tabs
            screenOptions={({ route }) => ({
                headerShown: true,
                tabBarActiveTintColor: "#4CAF50",
                tabBarInactiveTintColor: "#666",
                tabBarStyle: {
                    backgroundColor: "#fff",
                    borderTopWidth: 1,
                    borderTopColor: "#eee",
                    height: Platform.OS === "ios" ? 85 : 60,
                    paddingBottom: Platform.OS === "ios" ? 25 : 10,
                    paddingTop: 10,
                    display: route.name === "farmgram" ? "none" : "flex",
                },
                headerStyle: {
                    backgroundColor: "#4CAF50",
                },
                headerTintColor: "#fff",
            })}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: "Home",
                    tabBarIcon: ({ color }) => (
                        <FontAwesome5 name="home" size={24} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="farmgram"
                options={{
                    title: "Farmgram",
                    tabBarIcon: ({ color }) => (
                        <View style={styles.farmgramButton}>
                            <FontAwesome5
                                name="plus-circle"
                                size={24}
                                color="#fff"
                            />
                        </View>
                    ),
                    tabBarIconStyle: {
                        marginBottom: -10,
                    },
                    tabBarLabelStyle: {
                        fontSize: 12,
                        marginBottom: Platform.OS === "ios" ? 0 : 10,
                    },
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: "Profile",
                    tabBarIcon: ({ color }) => (
                        <FontAwesome5 name="user" size={24} color={color} />
                    ),
                }}
            />
        </Tabs>
    );
}

const styles = StyleSheet.create({
    farmgramButton: {
        width: 56,
        height: 56,
        backgroundColor: "#4CAF50",
        borderRadius: 28,
        marginBottom: Platform.OS === "ios" ? 40 : 60,
        justifyContent: "center",
        alignItems: "center",
        elevation: 4,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        borderWidth: 3,
        borderColor: "#fff",
    },
});
