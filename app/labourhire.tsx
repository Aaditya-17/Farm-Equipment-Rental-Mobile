import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    StyleSheet,
    FlatList,
} from "react-native";
import LaborInfo from "./labourinfo"; // Make sure to create this component in React Native

const HireLabour = () => {
    const [searchType, setSearchType] = useState("skill");
    const [searchQuery, setSearchQuery] = useState("");
    const [labors, setLabors] = useState([]);
    const [error, setError] = useState("");
    const [searched, setSearched] = useState(false);
    const [selectedLabor, setSelectedLabor] = useState(null);

    useEffect(() => {
        fetchAllLabors();
    }, []);

    const fetchAllLabors = async () => {
        try {
            const response = await fetch(
                "https://famerequipmentrental-springboot-production.up.railway.app/labor/all"
            );
            if (!response.ok) {
                throw new Error("Failed to fetch labor data.");
            }
            const data = await response.json();
            setLabors(data);
        } catch (err) {
            setError("Error fetching data: " + err.message);
        }
    };

    const fetchLaborsByQuery = async () => {
        setError("");
        setLabors([]);
        setSearched(true);

        if (!searchQuery.trim()) {
            setError(`Please enter a ${searchType}.`);
            return;
        }

        try {
            const encodedQuery = encodeURIComponent(searchQuery);
            const apiEndpoint =
                searchType === "skill"
                    ? `https://famerequipmentrental-springboot-production.up.railway.app/labor/skill/${encodedQuery}`
                    : `https://famerequipmentrental-springboot-production.up.railway.app/labor/location/${encodedQuery}`;

            const response = await fetch(apiEndpoint);

            if (!response.ok) {
                throw new Error(
                    `No labor found with ${searchType}: ${searchQuery}`
                );
            }

            const data = await response.json();
            setLabors(data);
        } catch (err) {
            setError("Error fetching data: " + err.message);
        }
    };

    const renderLaborCard = ({ item }) => (
        <TouchableOpacity
            style={styles.card}
            onPress={() => setSelectedLabor(item)}
        >
            <Text style={styles.cardTitle}>{item.name}</Text>
            <Text style={styles.cardText}>Skills: {item.skills}</Text>
            <Text style={styles.cardText}>
                Experience: {item.experience} years
            </Text>
            <Text style={styles.cardPrice}>
                Price Per Day: ₹{item.pricePerDay}
            </Text>
            <Text style={styles.cardText}>Location: {item.location}</Text>
        </TouchableOpacity>
    );

    if (selectedLabor) {
        return (
            <LaborInfo
                labor={selectedLabor}
                onBack={() => setSelectedLabor(null)}
            />
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Search for Labors</Text>

            <View style={styles.toggleContainer}>
                <TouchableOpacity
                    style={[
                        styles.toggleButton,
                        styles.toggleLeft,
                        searchType === "skill" && styles.toggleActive,
                    ]}
                    onPress={() => setSearchType("skill")}
                >
                    <Text
                        style={[
                            styles.toggleText,
                            searchType === "skill" && styles.toggleTextActive,
                        ]}
                    >
                        Search by Skill
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[
                        styles.toggleButton,
                        styles.toggleRight,
                        searchType === "location" && styles.toggleActive,
                    ]}
                    onPress={() => setSearchType("location")}
                >
                    <Text
                        style={[
                            styles.toggleText,
                            searchType === "location" &&
                                styles.toggleTextActive,
                        ]}
                    >
                        Search by Location
                    </Text>
                </TouchableOpacity>
            </View>

            <View style={styles.searchContainer}>
                <TextInput
                    style={styles.searchInput}
                    placeholder={`Enter ${searchType} (e.g., ${
                        searchType === "skill" ? "Ploughing" : "Pune"
                    })`}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
                <TouchableOpacity
                    style={styles.searchButton}
                    onPress={fetchLaborsByQuery}
                >
                    <Text style={styles.searchButtonText}>Search</Text>
                </TouchableOpacity>
            </View>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <FlatList
                data={labors}
                renderItem={renderLaborCard}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={styles.listContainer}
                ListEmptyComponent={
                    <Text style={styles.emptyText}>Loading...</Text>
                }
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: "white",
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#166534",
        textAlign: "center",
        marginVertical: 16,
    },
    toggleContainer: {
        flexDirection: "row",
        justifyContent: "center",
        marginBottom: 16,
    },
    toggleButton: {
        padding: 8,
        width: "40%",
    },
    toggleLeft: {
        borderTopLeftRadius: 4,
        borderBottomLeftRadius: 4,
        backgroundColor: "#dcfce7",
    },
    toggleRight: {
        borderTopRightRadius: 4,
        borderBottomRightRadius: 4,
        backgroundColor: "#dcfce7",
    },
    toggleActive: {
        backgroundColor: "#166534",
    },
    toggleText: {
        textAlign: "center",
        color: "#166534",
    },
    toggleTextActive: {
        color: "white",
    },
    searchContainer: {
        flexDirection: "row",
        marginBottom: 16,
    },
    searchInput: {
        flex: 1,
        borderWidth: 1,
        borderColor: "#d1d5db",
        borderRadius: 4,
        padding: 8,
        marginRight: 8,
    },
    searchButton: {
        backgroundColor: "#166534",
        padding: 8,
        borderRadius: 4,
        justifyContent: "center",
    },
    searchButtonText: {
        color: "white",
        fontWeight: "bold",
    },
    errorText: {
        color: "red",
        textAlign: "center",
        marginVertical: 8,
    },
    listContainer: {
        paddingBottom: 16,
    },
    card: {
        backgroundColor: "#f3f4f6",
        padding: 16,
        borderRadius: 8,
        marginVertical: 8,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 8,
    },
    cardText: {
        color: "#4b5563",
        marginBottom: 4,
    },
    cardPrice: {
        fontSize: 16,
        fontWeight: "600",
        color: "#111827",
        marginBottom: 4,
    },
    emptyText: {
        textAlign: "center",
        color: "#6b7280",
        marginTop: 16,
    },
});

export default HireLabour;
