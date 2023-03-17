import voucherService from "services/voucherService";
import { jest } from "@jest/globals";
import voucherRepository from "repositories/voucherRepository";
import { badRequestError, conflictError } from "utils/errorUtils";

describe("Create Voucher Test Suite", () => {
	it("should not be able to create a voucher that already exists", () => {
		expect(async () => {
			const voucher = {
				code: "123euExisto123",
				discount: 50,
			};

			jest
				.spyOn(voucherRepository, "getVoucherByCode")
				.mockImplementationOnce((): any => {
					return {
						id: 1,
						code: voucher.code,
						discount: voucher.discount,
						used: false,
					};
				});

			await voucherService.createVoucher(voucher.code, voucher.discount);
		}).rejects.toMatchObject(conflictError("Voucher already exist."));
	});

	it("should not be able to create a voucher if discount value is above 100 or below 1", () => {
		expect(async () => {
			const code = "teste123";
			const discount = 101;

			await voucherService.createVoucher(code, discount);
		}).rejects.toMatchObject(badRequestError("Discount value is invalid."));
	});

	it("should be able to create a voucher succesfully", async () => {
		const voucher = {
			id: 1,
			code: "123euToOk",
			discount: 50,
			used: false,
		};
		jest
			.spyOn(voucherRepository, "getVoucherByCode")
			.mockImplementationOnce((): any => {
				return undefined;
			});

		jest
			.spyOn(voucherRepository, "createVoucher")
			.mockImplementationOnce((): any => {
				return [voucher];
			});

		await voucherService.createVoucher(voucher.code, voucher.discount);

		expect(Promise.resolve);
	});
});

describe("Apply Voucher Test Suite", () => {
	it("should not be able to apply a voucher if it does not exists", () => {
		expect(async () => {
			const voucherCode = "naoexisto";
			const amount = 101;
			jest
				.spyOn(voucherRepository, "getVoucherByCode")
				.mockImplementationOnce((): any => {
					return null;
				});
			await voucherService.applyVoucher(voucherCode, amount);
		}).rejects.toMatchObject(conflictError("Voucher does not exist."));
	});

	it("should not be able to apply a voucher that was already used", () => {
		expect(async () => {
			const voucher = {
				code: "123FuiUsado",
				discount: 50,
			};

			const amount = 101;

			jest
				.spyOn(voucherRepository, "getVoucherByCode")
				.mockImplementationOnce((): any => {
					return {
						id: 1,
						code: voucher.code,
						discount: voucher.discount,
						used: true,
					};
				});
			await voucherService.applyVoucher(voucher.code, amount);
		}).rejects.toMatchObject(conflictError("Voucher was already used."));
	});

	it("should not be able to apply a voucher if the amount is below 100", () => {
		expect(async () => {
			const voucher = {
				code: "123abc",
				discount: 50,
			};

			const amount = 99;

			jest
				.spyOn(voucherRepository, "getVoucherByCode")
				.mockImplementationOnce((): any => {
					return {
						id: 1,
						code: voucher.code,
						discount: voucher.discount,
						used: false,
					};
				});

			await voucherService.applyVoucher(voucher.code, amount);
		}).rejects.toMatchObject(badRequestError("Amount value is invalid."));
	});

	it("should be able to apply a voucher succesfully", async () => {
		const voucher = {
			code: "123euExisto",
			discount: 50,
		};
		const amount = 120;

		jest
			.spyOn(voucherRepository, "getVoucherByCode")
			.mockImplementationOnce((): any => {
				return {
					id: 1,
					code: voucher.code,
					discount: voucher.discount,
					used: false,
				};
			});

		jest
			.spyOn(voucherRepository, "useVoucher")
			.mockImplementationOnce((): any => {
				return {
					id: 1,
					code: voucher.code,
					discount: voucher.discount,
					used: true,
				};
			});

		const result = await voucherService.applyVoucher(voucher.code, amount);

		expect(result).toMatchObject(
			expect.objectContaining({
				amount: expect.any(Number),
				discount: voucher.discount,
				finalAmount: expect.any(Number),
				applied: expect.any(Boolean),
			})
		);
	});
});
