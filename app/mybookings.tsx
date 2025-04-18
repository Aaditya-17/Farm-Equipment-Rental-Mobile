import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    ActivityIndicator,
    TouchableOpacity,
    Linking,
    Alert,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { FontAwesome5 } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useUser } from "./context/UserContext";

// Define the booking type
interface Equipment {
    name: string;
    owner: {
        firstName: string;
        lastName: string;
    };
}

interface EquipmentBooking {
    id: number;
    equipment: Equipment;
    status: string;
    startDate: string;
    endDate: string;
}

interface LaborBooking {
    id: number;
    labor: {
        name: string;
        skills: string;
    };
    status: string;
    startDate: string;
    endDate: string;
}

const MyBookings = () => {
    const [equipmentBookings, setEquipmentBookings] = useState<
        EquipmentBooking[]
    >([]);
    const [laborBookings, setLaborBookings] = useState<LaborBooking[]>([]);
    const [loading, setLoading] = useState(true);
    const { user } = useUser();

    useEffect(() => {
        const fetchAllBookings = async () => {
            try {
                const [equipmentResponse, laborResponse] = await Promise.all([
                    axios.get(
                        `https://famerequipmentrental-springboot-production.up.railway.app/booking/borrower-requests/${
                            user?.id || 10
                        }`
                    ),
                    axios.get(
                        `https://famerequipmentrental-springboot-production.up.railway.app/booking/labor/requests/${
                            user?.id || 10
                        }`
                    ),
                ]);

                setEquipmentBookings(equipmentResponse.data);
                setLaborBookings(laborResponse.data);
            } catch (error) {
                console.error("Error fetching bookings:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchAllBookings();
    }, [user]);

    const renderBookingCard = (
        booking: EquipmentBooking | LaborBooking,
        type: "equipment" | "labor"
    ) => {
        const handleDownloadReceipt = async () => {
            try {
                const url = `https://famerequipmentrental-springboot-production.up.railway.app/booking/pdf/${booking.id}`;
                await Linking.openURL(url);
            } catch (error) {
                console.error("Error downloading receipt:", error);
                Alert.alert("Error", "Failed to download receipt");
            }
        };

        return (
            <View key={booking.id} style={styles.card}>
                {type === "equipment" ? (
                    <>
                        <Text style={styles.equipmentName}>
                            {(booking as EquipmentBooking).equipment.name}
                        </Text>
                        <Text style={styles.ownerName}>
                            Owner:{" "}
                            {
                                (booking as EquipmentBooking).equipment.owner
                                    .firstName
                            }{" "}
                            {
                                (booking as EquipmentBooking).equipment.owner
                                    .lastName
                            }
                        </Text>
                    </>
                ) : (
                    <>
                        <Text style={styles.equipmentName}>
                            {(booking as LaborBooking).labor.name}
                        </Text>
                        <Text style={styles.ownerName}>
                            Skills: {(booking as LaborBooking).labor.skills}
                        </Text>
                    </>
                )}
                <Text style={styles.dates}>
                    From: {new Date(booking.startDate).toLocaleDateString()}{" "}
                    {"\n"}
                    To: {new Date(booking.endDate).toLocaleDateString()}
                </Text>
                <View style={styles.cardFooter}>
                    <View style={styles.statusContainer}>
                        <Text
                            style={[
                                styles.status,
                                {
                                    backgroundColor:
                                        booking.status === "APPROVED"
                                            ? "#4CAF50"
                                            : booking.status === "PENDING"
                                            ? "#FFC107"
                                            : "#F44336",
                                },
                            ]}
                        >
                            {booking.status}
                        </Text>
                    </View>
                    {booking.status === "APPROVED" && (
                        <TouchableOpacity
                            style={styles.downloadButton}
                            onPress={handleDownloadReceipt}
                        >
                            <FontAwesome5
                                name="file-pdf"
                                size={20}
                                color="white"
                                style={{ marginRight: 8 }}
                            />
                            <Text style={styles.downloadButtonText}>
                                Receipt
                            </Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        );
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#0066cc" />
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>My Bookings</Text>

            <Text style={styles.sectionTitle}>Equipment Bookings</Text>
            {equipmentBookings.length === 0 ? (
                <Text style={styles.noBookings}>
                    No equipment bookings found
                </Text>
            ) : (
                equipmentBookings.map((booking) =>
                    renderBookingCard(booking, "equipment")
                )
            )}

            <Text style={styles.sectionTitle}>Labor Bookings</Text>
            {laborBookings.length === 0 ? (
                <Text style={styles.noBookings}>No labor bookings found</Text>
            ) : (
                laborBookings.map((booking) =>
                    renderBookingCard(booking, "labor")
                )
            )}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: "#f5f5f5",
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 20,
        textAlign: "center",
        color: "#333",
    },
    card: {
        backgroundColor: "white",
        borderRadius: 10,
        padding: 16,
        marginBottom: 16,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        borderLeftWidth: 4,
        borderLeftColor: "#0066cc",
    },
    equipmentName: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#333",
        marginBottom: 8,
    },
    ownerName: {
        fontSize: 16,
        color: "#666",
        marginBottom: 8,
    },
    dates: {
        fontSize: 14,
        color: "#666",
        marginBottom: 8,
    },
    statusContainer: {
        flexDirection: "row",
        justifyContent: "flex-end",
    },
    status: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        color: "white",
        fontSize: 14,
        fontWeight: "bold",
    },
    noBookings: {
        textAlign: "center",
        fontSize: 16,
        color: "#666",
        marginTop: 20,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: "bold",
        marginTop: 20,
        marginBottom: 10,
        color: "#333",
        backgroundColor: "#e1e1e1",
        padding: 10,
        borderRadius: 5,
    },
    cardFooter: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: 8,
    },
    downloadButton: {
        backgroundColor: "#0066cc",
        padding: 8,
        borderRadius: 8,
        marginLeft: 10,
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        paddingHorizontal: 12,
    },
    downloadButtonText: {
        color: "white",
        fontSize: 14,
        fontWeight: "bold",
    },
});

export default MyBookings;
