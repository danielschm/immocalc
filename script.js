window.onload = function () {
    if (localStorage.getItem("scenario")) {
        const obj = JSON.parse(localStorage.getItem("scenario"));
        window.scenario = new Scenario(obj);
    } else {
        window.scenario = new Scenario();
    }
};

class Scenario {
    constructor(obj = {}) {
        this.squareMeter = parseFloat(obj.squareMeter) || 0;
        this.listPrice = parseFloat(obj.listPrice) || 0;
        this.pricePerSquareMeter = parseFloat(obj.pricePerSquareMeter) || 0;
        this.addCostsAgentPercentage = parseFloat(obj.addCostsAgentPercentage) || 0;
        this.addCostsAgent = parseFloat(obj.addCostsAgent) || 0;
        this.addCostsNotaryPercentage = parseFloat(obj.addCostsNotaryPercentage) || 0;
        this.addCostsNotary = parseFloat(obj.addCostsNotary) || 0;
        this.addCostsRealEstateTaxesPercentage = parseFloat(obj.addCostsRealEstateTaxesPercentage) || 0;
        this.addCostsRealEstateTaxes = parseFloat(obj.addCostsRealEstateTaxes) || 0;
        this.modernizationCosts = parseFloat(obj.modernizationCosts) || 0;
        this.renovationCosts = parseFloat(obj.renovationCosts) || 0;
        this.totalCost = parseFloat(obj.totalCost) || 0;
        this.equity = parseFloat(obj.equity) || 0;
        this.equitySuggestion = parseFloat(obj.equitySuggestion) || 0;
        this.borrowing = parseFloat(obj.borrowing) || 0;
        this.interestPercentage = parseFloat(obj.interestPercentage) || 0;
        this.interest = parseFloat(obj.interest) || 0;
        this.repaymentPercentage = parseFloat(obj.repaymentPercentage) || 0;
        this.repayment = parseFloat(obj.repayment) || 0;
        this.rentalFeeMonth = parseFloat(obj.rentalFeeMonth) || 0;
        this.rentalFeeYear = parseFloat(obj.rentalFeeYear) || 0;
        this.notMovableCosts = parseFloat(obj.notMovableCosts) || 0;
        this.investementReserves = parseFloat(obj.investementReserves) || 0;
        this.afaPercentage = parseFloat(obj.afaPercentage) || 0;
        this.afa = parseFloat(obj.afa) || 0;
        this.taxRatePercentage = parseFloat(obj.taxRatePercentage) || 0;
        this.taxRate = parseFloat(obj.taxRate) || 0;
        this.liquidityExcess = parseFloat(obj.liquidityExcess) || 0;
        this.returnOnCapital = parseFloat(obj.returnOnCapital) || 0;

        this.inputs = [
            "squareMeter",
            "listPrice",
            "addCostsAgentPercentage",
            "addCostsNotaryPercentage",
            "addCostsRealEstateTaxesPercentage",
            "modernizationCosts",
            "renovationCosts",
            "equity",
            "interestPercentage",
            "repaymentPercentage",
            "rentalFeeMonth",
            "notMovableCosts",
            "investmentReserves",
            "afaPercentage",
            "taxRatePercentage"
        ];

        this.readOnly = [
            "pricePerSquareMeter",
            "addCostsAgent",
            "addCostsNotary",
            "addCostsRealEstateTaxes",
            "interest",
            "repayment",
            "borrowing",
            "totalCost",
            "rentalFeeYear",
            "afa",
            "taxRate",
            "liquidityExcess",
            "returnOnCapital"
        ];
        this.initialize();
        this.focusedElement = null;
    }

    initialize() {
        const that = this;
        this.inputs.forEach(e => {
            const input = document.getElementById("__input_" + e);
            Scenario.initializeInput(input);

            input.addEventListener("click", function () {
                if (that.focusedElement === this) return;
                that.focusedElement = this;
                setTimeout(function () {
                    that.focusedElement.select();
                }, 50);
            });

            input.addEventListener("input", () => {
                that.update(e);
                that.calculate();
                that.update(e);
            });

            window.autoNumericGlobalList.get(input).set(this[e] || 0);
            window.autoNumericGlobalList.get(input).reformat();
        });
        this.readOnly.forEach(e => {
            const input = document.getElementById("__input_" + e);
            Scenario.initializeInput(input);
            window.autoNumericGlobalList.get(input).set(this[e] || 0);
            window.autoNumericGlobalList.get(input).reformat();
        });
        window._bInitializedOnce = true;
        this.update();
    }

    static initializeInput(el) {
        if (!window._bInitializedOnce) {
            new AutoNumeric(el, {
                digitGroupSeparator: '.',
                decimalCharacter: ',',
                decimalCharacterAlternative: '.',
                roundingMethod: AutoNumeric.options.roundingMethod.halfUpSymmetric,
                emptyInputBehavior: "0"
            });
        } else {
            window.autoNumericGlobalList.get(el).clear();
        }
    }

    update(bIgnoreRentalSlider = false) {
        this.inputs.forEach(e => {
            const input = document.getElementById("__input_" + e);
            this[e] = window.autoNumericGlobalList.get(input).getNumber();
        });

        this.readOnly.forEach(e => {
            const input = document.getElementById("__input_" + e);
            window.autoNumericGlobalList.get(input).set(this[e] || 0);
        });

        if (!bIgnoreRentalSlider) {
            document.getElementById("__slider_rentalFeeMonth").value = this.rentalFeeMonth;
        }

        [{
            id: "liquidityExcess",
            range: 0
        }, {
            id: "returnOnCapital",
            range: 5
        }].forEach(({id, range}) => {
            const el = document.getElementById("__input_" + id);
            this.updateInputValueState(id, el, range);
        });

        this.saveObj();
    }

    updateInputValueState(id, el, range) {
        const wrapper = document.getElementById(id);
        ["positive", "negative", "neutral"].forEach(e => {
            wrapper.classList.remove(e)
        });

        const value = window.autoNumericGlobalList.get(el).getNumber();
        if (value > 0) {
            if (value > range) {
                wrapper.classList.add("positive");
            } else {
                wrapper.classList.add("neutral");
            }
        } else if (value < 0) {
            wrapper.classList.add("negative");
        }
    }

    saveObj() {
        const obj = {};
        for (let property in this) {
            if (this.hasOwnProperty(property) && property !== "readOnly" && property !== "inputs") {
                obj[property] = this[property];
            }
        }
        localStorage.setItem("scenario", JSON.stringify(obj));
    }

    calculate() {
        this.pricePerSquareMeter = this.squareMeter > 0 ? this.listPrice / this.squareMeter : 0;
        this.addCostsAgent = this.addCostsAgentPercentage / 100 * this.listPrice;
        this.addCostsNotary = this.addCostsNotaryPercentage / 100 * this.listPrice;
        this.addCostsRealEstateTaxes = this.addCostsRealEstateTaxesPercentage / 100 * this.listPrice;
        this.totalCost = this.listPrice + this.addCostsAgent + this.addCostsNotary + this.addCostsRealEstateTaxes + this.modernizationCosts + this.renovationCosts;
        this.equitySuggestion = this.totalCost * 0.1;
        this.borrowing = this.totalCost - this.equity;
        this.interest = this.interestPercentage / 100 * this.borrowing;
        this.repayment = this.repaymentPercentage / 100 * this.borrowing;
        this.rentalFeeYear = this.rentalFeeMonth * 12;
        this.afa = this.afaPercentage / 100 * this.listPrice;
        this.taxRate = this.taxRatePercentage / 100 * (this.rentalFeeYear - this.afa - this.interest - this.notMovableCosts - this.investmentReserves);
        this.liquidityExcess = this.rentalFeeYear - this.interest - this.notMovableCosts - this.investmentReserves - this.repayment - this.taxRate;
        this.returnOnCapital = this.equity ? 100 * ((this.liquidityExcess + this.repayment) / this.equity) : 0;
    }

    inputRentalFee() {
        const value = document.getElementById("__slider_rentalFeeMonth").value;
        window.autoNumericGlobalList.get(document.getElementById("__input_rentalFeeMonth")).set(Math.round(value));
        this.calculate();
        this.update(true);
    }
}

function reset() {
    window.scenario = new Scenario();
}

function inputRentalFee() {
    window.scenario.inputRentalFee();
}