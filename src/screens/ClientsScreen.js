import React from "react";
import { ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useApp } from "../context/AppContext";
import { useStyles } from "../theme";
import ScreenHeader from "../components/ScreenHeader";
import Button from "../components/Button";
import { Card } from "../components/Card";
import ClientRow from "../components/ClientRow";
import EmptyState from "../components/EmptyState";

const makeStyles = ({ colors, spacing }) => ({
  screen: { flex: 1, backgroundColor: colors.background },
  body: { paddingHorizontal: spacing.lg, paddingBottom: 32 },
});

export default function ClientsScreen({ navigation }) {
  const { clients } = useApp();
  const styles = useStyles(makeStyles);
  const sorted = [...clients].sort((a, b) => a.name.localeCompare(b.name));

  return (
    <SafeAreaView style={styles.screen} edges={["top"]}>
      <ScreenHeader
        eyebrow={`${clients.length} ${clients.length === 1 ? "client" : "clients"}`}
        title="Clients"
        right={<Button label="New" icon="plus" onPress={() => navigation.navigate("ClientForm")} style={{ height: 40 }} />}
      />
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <Card padded={false}>
          {sorted.length === 0 ? (
            <EmptyState
              icon="users"
              title="No clients yet"
              subtitle="Add a client so you can pick them when creating invoices."
              actionLabel="Add client"
              onAction={() => navigation.navigate("ClientForm")}
            />
          ) : (
            sorted.map((client, i) => (
              <ClientRow
                key={client.id}
                client={client}
                last={i === sorted.length - 1}
                onPress={() => navigation.navigate("ClientForm", { clientId: client.id })}
              />
            ))
          )}
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}
