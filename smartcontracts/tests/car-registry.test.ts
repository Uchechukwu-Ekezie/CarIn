import { describe, expect, it } from "vitest";
import {
    uintCV,
    principalCV,
    stringAsciiCV,
    listCV,
    tupleCV,
} from "@stacks/transactions";

const accounts = simnet.getAccounts();
const alice = accounts.get("wallet_1")!;
const bob = accounts.get("wallet_2")!;

const REG = "car-registry";

function registerCar(
    plate: string,
    make: string,
    model: string,
    year: number,
    sender: string,
) {
    return simnet.callPublicFn(
        REG,
        "register-car",
        [
            stringAsciiCV(plate),
            stringAsciiCV(make),
            stringAsciiCV(model),
            uintCV(year),
        ],
        sender,
    );
}

function getCar(id: number) {
    return simnet.callReadOnlyFn(REG, "get-car", [uintCV(id)], alice).result;
}

function ownerCars(addr: string) {
    return simnet.callReadOnlyFn(REG, "get-owner-cars", [principalCV(addr)], addr).result;
}

describe("car-registry", () => {
    it("registers a car and returns its id", () => {
        const { result } = registerCar("ABC-123", "Toyota", "Corolla", 2020, alice);
        expect(result).toBeOk(uintCV(1));

        expect(getCar(1)).toBeSome(tupleCV({
            "owner": principalCV(alice),
            "plate-number": stringAsciiCV("ABC-123"),
            "make": stringAsciiCV("Toyota"),
            "model": stringAsciiCV("Corolla"),
            "year": uintCV(2020),
        }));
    });

    it("assigns monotonically-increasing car ids across owners", () => {
        const a = registerCar("AAA-1", "Make", "Model", 2020, alice);
        const b = registerCar("BBB-1", "Make", "Model", 2021, bob);
        const c = registerCar("CCC-1", "Make", "Model", 2022, alice);

        expect(a.result).toBeOk(uintCV(1));
        expect(b.result).toBeOk(uintCV(2));
        expect(c.result).toBeOk(uintCV(3));
    });

    it("appends new cars to the owner's list", () => {
        registerCar("AAA-1", "Make", "Model", 2020, alice);
        registerCar("AAA-2", "Make", "Model", 2021, alice);

        expect(ownerCars(alice)).toStrictEqual(
            listCV([uintCV(1), uintCV(2)]),
        );
    });

    it("returns an empty list for an owner with no cars", () => {
        expect(ownerCars(bob)).toStrictEqual(listCV([]));
    });

    it("returns none for an unknown car id", () => {
        expect(getCar(999)).toBeNone();
    });

    it("lets the owner update their car's details", () => {
        registerCar("ABC-123", "Toyota", "Corolla", 2020, alice);

        const { result } = simnet.callPublicFn(
            REG,
            "update-car",
            [
                uintCV(1),
                stringAsciiCV("XYZ-789"),
                stringAsciiCV("Toyota"),
                stringAsciiCV("Camry"),
                uintCV(2023),
            ],
            alice,
        );
        expect(result).toBeOk(expect.anything());

        expect(getCar(1)).toBeSome(tupleCV({
            "owner": principalCV(alice),
            "plate-number": stringAsciiCV("XYZ-789"),
            "make": stringAsciiCV("Toyota"),
            "model": stringAsciiCV("Camry"),
            "year": uintCV(2023),
        }));
    });

    it("rejects update-car from a non-owner", () => {
        registerCar("ABC-123", "Toyota", "Corolla", 2020, alice);

        const { result } = simnet.callPublicFn(
            REG,
            "update-car",
            [
                uintCV(1),
                stringAsciiCV("HACK-1"),
                stringAsciiCV("X"),
                stringAsciiCV("Y"),
                uintCV(1999),
            ],
            bob,
        );
        expect(result).toBeErr(uintCV(100)); // err-not-authorized
    });

    it("rejects update-car for an unknown car id", () => {
        const { result } = simnet.callPublicFn(
            REG,
            "update-car",
            [
                uintCV(999),
                stringAsciiCV("ABC"),
                stringAsciiCV("X"),
                stringAsciiCV("Y"),
                uintCV(2000),
            ],
            alice,
        );
        expect(result).toBeErr(uintCV(101)); // err-car-not-found
    });
});
