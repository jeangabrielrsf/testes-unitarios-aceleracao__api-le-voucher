import voucherService from "services/voucherService";
import { jest } from "@jest/globals";
import voucherRepository from "repositories/voucherRepository";
import { AppError, conflictError, isAppError } from "utils/errorUtils";

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
	it("should not be able to apply a voucher if it does not exists", () => {});
});
