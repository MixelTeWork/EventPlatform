import React from "react"
import styles from "./styles.module.css"
import { useMutationUserSetName, useMutationUserSetPassword, useMutationUserSetRoles, useUsersRoles, type UserFull } from "@/api/user";
import Button from "@sCmps/Button";
import Select from "@sCmps/Select";
import IconCancel from "@icons/cancel";
import IconAdd from "@icons/add";
import useStateObj from "@/utils/useStateObj";
import IconSave from "@icons/save";
import Spinner from "@/components/Spinner";
import displayError from "@/utils/displayError";
import Input from "@sCmps/Input";

export default function User({ data }: { data: UserFull })
{
	const password = useStateObj("***");
	const name = useStateObj(data.name);
	const setPassword = useMutationUserSetPassword(data.id, () => password.set("***"));
	const setName = useMutationUserSetName(data.id);

	const allRoles = useUsersRoles();
	const curRoles = useStateObj(data.roles.map(v => v.id));
	const setRoles = useMutationUserSetRoles(data.id);

	const rolesNew = allRoles.data?.filter(r => !curRoles.v.find(id => id == r.id)) || [];
	const adminI = rolesNew.findIndex(v => v.id == 1) ?? -1;
	if (adminI >= 0) rolesNew.push(rolesNew.splice(adminI, 1)?.[0]);

	const selectedRole = useStateObj(rolesNew[0]?.id ?? -1);
	if (selectedRole.v > 0 && !rolesNew.find(v => v.id == selectedRole.v))
		selectedRole.set(-1);
	if (selectedRole.v < 0 && rolesNew.length > 0)
		selectedRole.set(rolesNew[0].id);

	const rolesChanged = new Set(data.roles.map(v => v.id)).symmetricDifference(new Set(curRoles.v)).size != 0;

	return (
		<div className={styles.user}>
			{setRoles.isPending && <Spinner block r="0.3em" />}
			{setPassword.isPending && <Spinner block r="0.3em" />}
			{setName.isPending && <Spinner block r="0.3em" />}
			<input type="checkbox" className={styles.toggleInp} id={`user${data.id}`} />
			<label className={styles.title} htmlFor={`user${data.id}`}>
				<div>
					<div>{data.login}</div>
					<div style={{ color: "lightblue" }}>{data.id}</div>
					<div>|</div>
					<div>{data.name}</div>
				</div>
				<div>
					{data.deleted && <>
						<div style={{ color: "tomato" }}>deleted</div>
						<div>|</div>
					</>}
					<span>{data.roles.map(v => v.name).join(", ")}</span>
					<div className={styles.toggle}></div>
				</div>
			</label>
			<div className={styles.userInfo}>
				<div>
					<h4>Operations</h4>
					<div className={styles.operations}>
						{data.operations.map(o => <div key={o}>{colorizeOperation(o)}</div>)}
					</div>
				</div>
				<div>
					<h4>Roles</h4>
					{displayError(setRoles)}
					<div className={styles.roles}>
						{curRoles.v.map(rid => <div key={rid}>
							<span>{allRoles.data?.find(v => v.id == rid)?.name}</span>
							<Button text={<IconCancel />} size="1.2rem" onClick={() =>
							{
								curRoles.set(v => v.filter(id => id != rid));
							}} />
						</div>)}
						<div>
							<Select values={rolesNew} item={it => ({ id: it.id, text: it.name })} stateObj={selectedRole} />
							<Button text={<IconAdd />} size="1.2rem" disabled={selectedRole.v < 0} onClick={() =>
							{
								if (selectedRole.v < 0) return;
								curRoles.set(v => [...v, selectedRole.v]);
							}} />
						</div>
						{rolesChanged && <div className={styles.roles__btns}>
							<Button text={<IconCancel />} size="1.5rem" onClick={() => curRoles.set(data.roles.map(v => v.id))} />
							<Button text={<IconSave />} size="1.5rem" danger disabled={setRoles.isPending} onClick={() => setRoles.mutate(curRoles.v)} />
						</div>}
					</div>
				</div>
				<div>
					<h4>Data</h4>
					<div className={styles.data}>
						<span>password: </span>
						<Input type="text" stateObj={password} />
						<div className={styles.data__btns}>{password.v != "***" && <>
							<Button text={<IconCancel />} onClick={() => password.set("***")} />
							<Button text={<IconSave />} danger disabled={setPassword.isPending} onClick={() => setPassword.mutate(password.v)} />
						</>}</div>
						<div>{displayError(setPassword)}</div>
						<span>name: </span>
						<Input type="text" stateObj={name} />
						<div className={styles.data__btns}>{name.v != data.name && <>
							<Button text={<IconCancel />} onClick={() => name.set(data.name)} />
							<Button text={<IconSave />} danger disabled={setName.isPending} onClick={() => setName.mutate(name.v)} />
						</>}</div>
						<div>{displayError(setName)}</div>
					</div>
				</div>
			</div>
		</div>
	);
}

function colorizeOperation(operation: string)
{
	const colors = {
		page: "#ff95ff",
		add: "#00b100",
		get: "#00b100",
		change: "#66c5ff",
		manage: "#66c5ff",
		delete: "#ff6666",
	}
	for (const prefix in colors)
	{
		if (operation.startsWith(prefix))
			return <>
				<span style={{ color: colors[prefix as keyof typeof colors] }}>{prefix}</span>
				<span>{operation.slice(prefix.length)}</span>
			</>
	}
	return <span>{operation}</span>
}