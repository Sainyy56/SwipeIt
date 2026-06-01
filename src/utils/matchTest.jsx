import { useEffect, useState } from "react";
import { getAllUsers } from "../services/userService";
import { runMatchingUtils } from "./matchUtils";

function Match() {

    const [matches, setMatches] = useState([]);

    useEffect(() => {

        async function loadMatches() {

            const users = await getAllUsers();

            console.log("Firebase Users:", users);

            if (users.length === 0) return;

            const currentUser = users[0]; // temporary

            const results = runMatchingUtils(currentUser, users);

            setMatches(results);
        }

        loadMatches();

    }, []);

    return (
        <div>
            <h1>Match Results</h1>

            {matches.map(match => (
                <div key={match.id}>
                    <h3>{match.name}</h3>
                    <p>Score: {match.score}</p>
                    <p>Category: {match.category}</p>
                </div>
            ))}
        </div>
    );
}

export default Match;
