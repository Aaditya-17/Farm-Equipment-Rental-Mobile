import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    Image,
    TouchableOpacity,
    ScrollView,
    StyleSheet,
    Alert,
    Platform,
} from "react-native";
import axios from "axios";
import { Calendar } from "react-native-calendars";
import { Picker } from "@react-native-picker/picker";
import { useUser } from "./context/UserContext";

const LaborInfo = ({ labor, onBack }) => {
    if (!labor) return null;

    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [bookedDates, setBookedDates] = useState({});
    const [paymentMethod, setPaymentMethod] = useState("COD");
    const { user } = useUser();

    useEffect(() => {
        fetchLaborAvailability();
    }, [labor.id]);

    const fetchLaborAvailability = async () => {
        try {
            const response = await axios.get(
                `https://famerequipmentrental-springboot-production.up.railway.app/booking/labor/calendar/${labor.id}`
            );

            // Convert booked dates array to object format required by react-native-calendars
            const markedDates = {};
            response.data.bookedDates.forEach((date) => {
                markedDates[date] = {
                    selected: true,
                    marked: true,
                    disabled: true,
                };
            });
            setBookedDates(markedDates);
        } catch (error) {
            console.error("Error fetching labor availability:", error);
            Alert.alert("Error", "Failed to fetch labor availability");
        }
    };

    const handleBookLabor = async () => {
        try {
            const requestBody = {
                labor: { id: labor.id },
                farmerId: user.id,
                farmerEmail: user.email,
                startDate: startDate,
                endDate: endDate,
                paymentMethod: paymentMethod,
            };

            const response = await axios.post(
                "https://famerequipmentrental-springboot-production.up.railway.app/booking/labor/request",
                requestBody
            );

            Alert.alert("Success", "Labor booking request sent successfully!");
        } catch (error) {
            console.error("Error during labor booking:", error);
            Alert.alert("Error", "Failed to book labor. Please try again.");
        }
    };

    return (
        <ScrollView style={styles.container}>
            <TouchableOpacity style={styles.backButton} onPress={onBack}>
                <Text style={styles.backButtonText}>← Back</Text>
            </TouchableOpacity>

            <View style={styles.profileContainer}>
                <Image
                    source={require("../assets/images/profile-png.png")}
                    style={styles.profileImage}
                />

                <View style={styles.infoContainer}>
                    <Text style={styles.name}>{labor.name}</Text>
                    <Text style={styles.infoText}>Skills: {labor.skills}</Text>
                    <Text style={styles.infoText}>
                        Experience: {labor.experience} years
                    </Text>
                    <Text style={styles.infoText}>
                        Price Per Day: ₹{labor.pricePerDay}
                    </Text>
                    <Text style={styles.infoText}>
                        Location: {labor.location}
                    </Text>
                    <Text style={styles.infoText}>
                        Contact: {labor.contact}
                    </Text>
                </View>
            </View>

            <View style={styles.calendarContainer}>
                <Text style={styles.sectionTitle}>Availability Calendar</Text>
                <Calendar
                    onDayPress={(day) => {
                        if (!startDate || (startDate && endDate)) {
                            setStartDate(day.dateString);
                            setEndDate("");
                        } else if (!endDate) {
                            setEndDate(day.dateString);
                        }
                    }}
                    markedDates={{
                        ...(startDate && {
                            [startDate]: {
                                selected: true,
                                selectedColor: "blue",
                            },
                        }),
                        ...(endDate && {
                            [endDate]: {
                                selected: true,
                                selectedColor: "green",
                            },
                        }),
                        ...bookedDates,
                    }}
                    style={{ marginVertical: 10 }}
                />
            </View>

            <View style={styles.bookingForm}>
                <Text style={styles.sectionTitle}>Book This Labor</Text>

                <Text style={styles.label}>Start Date</Text>
                <Text style={styles.dateDisplay}>
                    {startDate || "Select start date"}
                </Text>

                <Text style={styles.label}>End Date</Text>
                <Text style={styles.dateDisplay}>
                    {endDate || "Select end date"}
                </Text>

                <Text style={styles.label}>Payment Method</Text>
                <Picker
                    selectedValue={paymentMethod}
                    onValueChange={(itemValue) => setPaymentMethod(itemValue)}
                    style={styles.picker}
                >
                    <Picker.Item label="Cash on Delivery" value="COD" />
                    <Picker.Item label="Online Payment" value="Online" />
                </Picker>

                <TouchableOpacity
                    style={styles.hireButton}
                    onPress={handleBookLabor}
                >
                    <Text style={styles.hireButtonText}>Hire Now</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "white",
        padding: 16,
    },
    backButton: {
        padding: 8,
        backgroundColor: "#e5e7eb",
        borderRadius: 8,
        marginBottom: 16,
        width: 80,
    },
    backButtonText: {
        fontSize: 16,
        color: "#374151",
    },
    profileContainer: {
        backgroundColor: "white",
        borderRadius: 8,
        padding: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    profileImage: {
        width: 120,
        height: 120,
        borderRadius: 60,
        alignSelf: "center",
    },
    infoContainer: {
        marginTop: 16,
    },
    name: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#166534",
        marginBottom: 8,
    },
    infoText: {
        fontSize: 16,
        color: "#4b5563",
        marginBottom: 4,
    },
    calendarContainer: {
        marginTop: 24,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#374151",
        marginBottom: 12,
    },
    bookingForm: {
        marginTop: 24,
        backgroundColor: "#f3f4f6",
        padding: 16,
        borderRadius: 8,
    },
    label: {
        fontSize: 16,
        color: "#374151",
        marginTop: 12,
        marginBottom: 4,
    },
    dateDisplay: {
        fontSize: 16,
        padding: 8,
        backgroundColor: "white",
        borderRadius: 4,
        borderWidth: 1,
        borderColor: "#d1d5db",
    },
    picker: {
        backgroundColor: "white",
        marginTop: 8,
    },
    hireButton: {
        backgroundColor: "#166534",
        padding: 12,
        borderRadius: 8,
        marginTop: 16,
        alignItems: "center",
    },
    hireButtonText: {
        color: "white",
        fontSize: 16,
        fontWeight: "bold",
    },
});

export default LaborInfo;
